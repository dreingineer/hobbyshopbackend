const db = require('../models/index');
const utils = require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sorter = require('../helpers/sorter');

const Brand = db.Brand;

const post = async(req, res) => {
    res.setHeader('Content-type','application/json');
    const {
        name,
        description,
        country,
        categoryId,
    } = req.body;
    let err, brand;
    [err, brand] = await to(Brand.create({
        'name': name,
        'description': description,
        'country': country,
        'categoryId': categoryId
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message': 'Successfully created a brand',
                    'Created brand' : brand}, 200);
};

const getAll = async (req, res) => {
    res.setHeader('Content-type', 'application/json');
    [err, brands] = await to(Brand.findAll({
        paranoid: false
    }));
    return ReS(res, {'All brands': brands});
};

const getOne = async(req, res) => {
    res.setHeader('Content-type', 'application/json');
    const id = req.params.id;
    [err, brand] = await to(Brand.findByPk(id));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'Brand': brand}, 200); 
};

const updateById = async(req, res) => {
    const id = req.params.id;
    let err, brand;
    [err, brand] = await to(Brand.update({...req.body}, {
        where: {
            id: id
        }
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message':'Updated a brand successfully',
                    'Updated brand': brand}, 200);
};

const deleteById = async (req, res) => {
    let err, brand;
    const id = req.params.id;
    [err, brand] = await to(Brand.destroy({
        where: {id:id}
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message':`Deleted brand ${id}`,
                    'Deleted brand': brand,
                    paranoid: false}, 200);
};

const getBrandList = async (req, res) => {
    let limit = 10;
    let offset = 0;
    Brand.findAndCountAll()
    .then( data => {
        let page = req.params.page;
        let pages = Math.ceil(data.count / limit);
            offset = limit * (page -1);
        Brand.findAll({
            attributes: ['id','name','description','country','categoryId'],
            limit: limit,
            offset: offset,
            $sort: {id:1}
        })
        .then( brands => {
            res.status(200).json({'result': brands, 'count': data.count, 'pages':pages});
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
        country: '',
        categoryId:''
    }

    async function insert(json) {
        let err, brand;
        [err, brand] = await to(Brand.bulkCreate(json));
        if(err) return ReE(res, err, 500);

        return ReS(res, {
            message: 'Successfully imported CSV file',
            data: brand
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
    let err, brand;

    [err, brand] = await to(Brand.findAll({
        paranoid: false
    }));
    if(err) return ReE(res, err, 500);
    if(!brand) return ReE(res, {message:'No data to download'}, 400);

    brand = utils.clone(brand);

    const json2csv = require('json2csv').Parser;
    const parser = new json2csv({encoding:'utf-8', withBOM: true});
    const csv = parser.parse(brand);

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

    Brand.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('name'), ', ', db.sequelize.col('description'),',', db.sequelize.col('country'),',', db.sequelize.col('categoryId')), 'Filtered Result(s):'],
        ],
        where: condition,
        order: sort,
        paranoid: false
    }).then(brands => {
        res.send(brands);
    }).catch(err => {
        console.log(err);
    });
};

const search = async (req, res) => {
    const {
        id,
        name,
        description,
        country,
        categoryId
    } = req.query;
    [err, brands] = await to(Brand.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('name'),',', db.sequelize.col('description'),',', db.sequelize.col('country'),',', db.sequelize.col('categoryId')), 'Filtered:']
        ],
        where: {
            [Op.or]: [
                {id: {[Op.like]: '%' +id+ '%'}},
                {name: {[Op.like]: '%' +name+ '%'}},
                {description: {[Op.like]: '%' +description+ '%'}},
                {country: {[Op.like]: '%' +country+ '%'}},
                {categoryId: {[Op.like]: '%' +categoryId+ '%'}},
            ]
        },
        paranoid:false,
        limit: 10
    }));
    
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        message: 'Searched: ',
        data: brands
    }, 200);
};



module.exports = {
    post,
    getAll,
    getOne,
    updateById,
    deleteById,
    getBrandList,
    importcsv,
    exportcsv,
    filter,
    search
}
