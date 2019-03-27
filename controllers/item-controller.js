const db = require('../models/index');
const utils = require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sorter = require('../helpers/sorter');

const Item = db.Item;

const post = async(req, res) => {
    res.setHeader('Content-type', 'application/json');
    const {
        name,
        description,
        brandId
    } = req.body;
    let err, item;
    [err, item] = await to(Item.create({
        'name': name,
        'description': description,
        'brandId': brandId
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message': 'Successfully created an item',
                    'Created item': item}, 200);
};

const getAll = async(req,res) => {
    res.setHeader('Content-type', 'application/json');
    [err, items] = await to(Item.findAll({
        paranoid: false
    }));
    return ReS(res, {'All items':items});
};

const getOne = async(req, res) => {
    res.setHeader('Content-type','application/json');
    const id = req.params.id;
    [err, item] = await to(Item.findByPk(id));
    if(err) ReE(res, err, 500);
    return ReS(res, {'Item':  item}, 200);
};

const updateById = async(req, res) => {
    const id = req.params.id;
    let err, item;
    [err, item] = await to(Item.update({...req.body},{
        where: {
            id: id
        }
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message':'Updated an item successfully',
                    'Updated item': item}, 200);
};

const deleteById = async(req, res) => {
    let err, item;
    const id = req.params.id;
    [err, item] = await to(Item.destroy({
        where: {id:id}
    }));
    if(err) ReE(res, err, 500);
    return ReS(res, {'message':`Deleted item ${id}`,
                    'Deleted item': item,
                    paranoid: false}, 200);
};

const getItemList = async (req, res) => {
    let limit = 10;
    let offset = 0;
    Item.findAndCountAll()
    .then( data => {
        let page = req.params.page;
        let pages = Math.ceil(data.count / limit);
            offset = limit * (page -1);
        Item.findAll({
            attributes: ['id','name','description','brandId'],
            limit: limit,
            offset: offset,
            $sort: {id:1}
        })
        .then( items => {
            res.status(200).json({'result': items, 'count': data.count, 'pages':pages});
        });
    })
    .catch( err => {
        res.status(500).send('Internal server error');
    });
};

const importcsv = async (req, res) => {
    const file = req.file ? req.file.path : null;
    console.log('File', file);
    if(!file) return ReE(res, { message: 'CSV file not found'}, 400);

    const csv = require('../helpers/csv_validator');

    const headers = {
        name: '',
        description: '',
        brandId: '',
    }

    async function insert(json) {
        let err, item;
        [err, item] = await to(Item.bulkCreate(json));
        if(err) return ReE(res, err, 500);

        return ReS(res, {
            message: 'Successfully imported CSV file',
            data: item
        }, 200);
    }

    async function validateJSON(json) {
        insert(json);
    }

    function start() {
        csv(file, headers)
        .then( result => {
            validateJSON(result);
        })
        .catch(err => {
            return ReE(res, {
                message: 'Failed to import csv file',
                data: err
            }, 400);
        });
    }
    start();
}

const exportcsv = async (req, res) => {
    let err, item;

    [err, item] = await to(Item.findAll({
        paranoid: false
    }));
    if(err) return ReE(res, err, 500);
    if(!item) return ReE(res, {message:'No data to download'}, 400);

    item = utils.clone(item);

    const json2csv = require('json2csv').Parser;
    const parser = new json2csv({encoding:'utf-8', withBOM: true});
    const csv = parser.parse(item);

    res.setHeader('Content-disposition', 'attachment; filename=Shop.csv');
    res.set('Content-type','text/csv');
    res.send(csv);
}

const filter = async (req, res) => {
    let reqQuery = req.query;
    let reqQuery_Sort = req.query.sortBy;
    let condition = {};
    let sort = [];

    if (Object.keys(reqQuery).length > 0) {
        if (reqQuery_Sort) {
            sort = await sorter.convertToArrSort(reqQuery_Sort);
            delete reqQuery.sortBy;
        }
        condition = reqQuery;
    }

    Item.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('name'), ', ', db.sequelize.col('description'),',', db.sequelize.col('brandId')), 'Filtered Result(s):'],
        ],
        where: condition,
        order: sort,
        paranoid: false
    }).then(items => {
        res.send(items);
    }).catch(err => {
        console.log(err);
    });
};

const search = async (req, res) => {
    const {
        id,
        name,
        description,
        brandId
    } = req.query;
    [err, items] = await to(Item.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('name'),',', db.sequelize.col('description'), db.sequelize.col('brandId')), 'Filtered:']
        ],
        where: {
            [Op.or]: [
                {id: {[Op.like]: '%' +id+ '%'}},
                {name: {[Op.like]: '%' +name+ '%'}},
                {description: {[Op.like]: '%' +description+ '%'}},
                {brandId: {[Op.like]: '%' +brandId+ '%'}},
            ]
        },
        paranoid:false,
        limit: 10
    }));
    
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        message: 'Searched: ',
        data: items
    }, 200);
};



module.exports = {
    post,
    getAll,
    getOne,
    updateById,
    deleteById,
    getItemList,
    importcsv,
    exportcsv,
    filter,
    search
}
