const db = require('../models/index');
const utils =  require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sorter = require('../helpers/sorter');

const Shop = db.Shop;
const Location = db.Location;

// post a shop
const post = async (req, res) => {
    res.setHeader('Content-type','application/json');
    const {
        owner,
        founded,
        locationId
    } = req.body;
    let err, shop;
    [err, shop] = await to(Shop.create({
        'owner': owner,
        'founded': founded,
        'locationId': locationId
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message': 'Successfully created a shop',
                    'Created Shop': shop}, 200);
};

// get all shop with association
const getAll = async (req, res) => {
    res.setHeader('Content-type','application/json');
    [err, shops] = await to(Shop.findAll({
        include: [{all: true}],
        paranoid: false,
    }));
    if(err) ReE(res, err, 500);
    return ReS(res, {'All Shops': shops});
};

// get shop by id
const getOne = async (req, res) => {
    res.setHeader('Content-type','application/json');
    const id = req.params.id;
    [err, shop] = await to(Shop.findByPk(id));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'Shop':shop}, 200);
};

// update a shop
const updateById = async (req, res) => {
    const id = req.params.id;
    let err, shop;
    [err, shop] = await to(Shop.update({...req.body}, {
        where: {
            id: id
        }
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message': 'Updated a shop successfully',
                    'Updated Shop': shop}, 200);
};

// delete a shop
const deleteById = async (req, res) => {
    let err, shop;
    const id = req.params.id;
    [err, shop] = await to(Shop.destroy({
        where: {id: id}
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message': `Deleted shop ${id}`,
                    'Deleted shop': shop}, 200);
};

// shop pagination
const getShopList = async (req, res) => {
    let limit = 10;
    let offset = 0;
    Shop.findAndCountAll()
    .then( data => {
        let page = req.params.page;
        let pages = Math.ceil(data.count / limit);
            offset = limit * (page -1);
        Shop.findAll({
            attributes: ['id','owner','founded','locationId'],
            limit: limit,
            offset: offset,
            $sort: { id: 1}
        })
        .then( shops => {
            res.status(200).json({'result': shops, 'count': data.count, 'pages': pages});
        });
    })
    .catch( err => {
        res.status(500).send('Internal server error');
    });
};

// import csv for shop
const importcsv = async (req, res) => {
    const file = req.file ? req.file.path : null;
    console.log('File', file);
    if(!file) return ReE(res, { message: 'CSV file not found'}, 400);

    const csv = require('../helpers/csv_validator');

    const headers = {
        owner: '',
        founded: '',
        locationId:''
    }

    async function insert(json) {
        let err, shop;
        [err, shop] = await to(Shop.bulkCreate(json));
        if(err) return ReE(res, err, 500);

        return ReS(res, {
            message: 'Successfully imported CSV file',
            data: shop
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

// export shops
const exportcsv = async (req, res) => {
    let err, shop;

    [err, shop] = await to(Shop.findAll({
        paranoid: false
    }));
    if(err) return ReE(res, err, 500);
    if(!shop) return ReE(res, {message:'No data to download'}, 400);

    shop = utils.clone(shop);

    const json2csv = require('json2csv').Parser;
    const parser = new json2csv({encoding:'utf-8', withBOM: true});
    const csv = parser.parse(shop);

    res.setHeader('Content-disposition', 'attachment; filename=Shop.csv');
    res.set('Content-type','text/csv');
    res.send(csv);
}

// search filter shops
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

    Shop.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('owner'), ', ', db.sequelize.col('founded')), 'Filtered Result(s):'],
        ],
        where: condition,
        order: sort,
        paranoid: false
    }).then(shops => {
        res.send(shops);
    }).catch(err => {
        console.log(err);
    });
};

// search like shops (radagast template)
const search = async (req, res) => {
    const {
        id,
        owner,
        founded,
        locationId
    } = req.query;
    [err, shops] = await to(Shop.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('owner'),',', db.sequelize.col('founded'),',', db.sequelize.col('locationId')), 'Filtered:']
        ],
        where: {
            [Op.or]: [
                {id: {[Op.like]: '%' +id+ '%'}},
                {owner: {[Op.like]: '%' +owner+ '%'}},
                {founded: {[Op.like]: '%' +founded+ '%'}},
                {locationId: {[Op.like]: '%' +locationId+ '%'}}
            ]
        },
        paranoid:false,
        limit: 10
    }));
    
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        message: 'Searched: ',
        data: shops
    }, 200);
};


module.exports = {
    post,
    getAll,
    getOne,
    updateById,
    deleteById,
    getShopList,
    importcsv,
    exportcsv,
    filter,
    search
}
