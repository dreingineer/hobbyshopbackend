const db = require('../models/index');
const utils = require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sorter = require('../helpers/sorter');

const Category = db.Category;

// create a category
const post = async(req, res) => {
    res.setHeader('Content-type','application/json');
    const {
        name,
        description,
        shopId   
    } = req.body;
    let err, category;
    [err, category] = await to(Category.create({
        'name': name,
        'description': description,
        'shopId': shopId
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message': 'Successfully created a category',
                    'Created Category' : category}, 200);
};

// get all category
const getAll = async (req, res) => {
    res.setHeader('Content-type', 'application/json');
    [err, categories] = await to(Category.findAll({
        paranoid: false
    }));
    return ReS(res, {'All categories': categories});
};

// get category by id
const getOne = async(req, res) => {
    res.setHeader('Content-type', 'application/json');
    const id = req.params.id;
    [err, category] = await to(Category.findByPk(id));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'Category': category}, 200); 
};

// update a category
const updateById = async(req, res) => {
    const id = req.params.id;
    let err, category;
    [err, category] = await to(Category.update({...req.body}, {
        where: {
            id: id
        }
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message':'Updated a category successfully',
                    'Updated category': category}, 200);
};

// delete a category
const deleteById = async (req, res) => {
    let err, category;
    const id = req.params.id;
    [err, category] = await to(Category.destroy({
        where: {id:id}
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message':`Deleted category ${id}`,
                    'Deleted category': category}, 200);
};

// category pagination
const getCategoryList = async (req, res) => {
    let limit = 10;
    let offset = 0;
    Category.findAndCountAll()
    .then( data => {
        let page = req.params.page;
        let pages = Math.ceil(data.count / limit);
            offset = limit * (page -1);
        Category.findAll({
            attributes: ['id','name','description','shopId'],
            limit: limit,
            offset: offset,
            $sort: {id:1}
        })
        .then( categories => {
            res.status(200).json({'result': categories, 'count': data.count, 'pages':pages});
        });
    })
    .catch( err => {
        res.status(500).send('Internal server error');
    });
};

// import csv for category
const importcsv = async (req, res) => {
    const file = req.file ? req.file.path : null;
    console.log('File', file);
    if(!file) return ReE(res, { message: 'CSV file not found'}, 400);

    const csv = require('../helpers/csv_validator');

    const headers = {
        name: '',
        description: '',
        shopId:''
    }

    async function insert(json) {
        let err, category;
        [err, category] = await to(Category.bulkCreate(json));
        if(err) return ReE(res, err, 500);

        return ReS(res, {
            message: 'Successfully imported CSV file',
            data: category
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

// export categories
const exportcsv = async (req, res) => {
    let err, category;

    [err, category] = await to(Category.findAll({
        paranoid: false
    }));
    if(err) return ReE(res, err, 500);
    if(!category) return ReE(res, {message:'No data to download'}, 400);

    category = utils.clone(category);

    const json2csv = require('json2csv').Parser;
    const parser = new json2csv({encoding:'utf-8', withBOM: true});
    const csv = parser.parse(category);

    res.setHeader('Content-disposition', 'attachment; filename=Shop.csv');
    res.set('Content-type','text/csv');
    res.send(csv);
}

// search - filter categories
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

    Category.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('name'), ', ', db.sequelize.col('description'),',', db.sequelize.col('shopId')), 'Filtered Result(s):'],
        ],
        where: condition,
        order: sort,
        paranoid: false
    }).then(categories => {
        res.send(categories);
    }).catch(err => {
        console.log(err);
    });
};

// search like in category
const search = async (req, res) => {
    const {
        id,
        name,
        description,
        shopId
    } = req.query;
    [err, categories] = await to(Category.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('name'),',', db.sequelize.col('description'),',', db.sequelize.col('shopId')), 'Filtered:']
        ],
        where: {
            [Op.or]: [
                {id: {[Op.like]: '%' +id+ '%'}},
                {name: {[Op.like]: '%' +name+ '%'}},
                {description: {[Op.like]: '%' +description+ '%'}},
                {shopId: {[Op.like]: '%' +shopId+ '%'}}
            ]
        },
        paranoid:false,
        limit: 10
    }));
    
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        message: 'Searched: ',
        data: categories
    }, 200);
};

module.exports = {
    post,
    getAll,
    getOne,
    updateById,
    deleteById,
    getCategoryList,
    importcsv,
    exportcsv,
    filter,
    search
}
