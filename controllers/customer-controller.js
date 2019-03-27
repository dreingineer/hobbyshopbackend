const db = require('../models/index');
const utils = require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sorter = require('../helpers/sorter');

const Customer = db.Customer;

const post = async(req, res) => {
    res.setHeader('Content-type','application/json');
    const {
        name,
        gender,
        address,
        itemId,
        locationId
    } = req.body;
    let err, customer;
    [err, customer] = await to(Customer.create({
        'name': name,
        'gender': gender,
        'address': address,
        'itemId': itemId,
        'locationId': locationId
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message': 'Successfully created a customer',
                    'Created customer': customer}, 200);
};

const getAll = async (req, res) => {
    res.setHeader('Content-type','application/json');
    [err, customers] = await to(Customer.findAll({
        paranoid:false
    }));
    return ReS(res, {'All customers': cutsomers});
};

const getOne = async(req, res) => {
    res.setHeader('Content-type','application/json');
    const id = req.params.id;
    [err, customer] = await to(Customer.findByPk(id));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'Cutomer': customer}, 200);
};

const updateById = async(req, res) => {
    const id = req.params.id;
    let err, customer;
    [err, customer] = await to(Customer.update({...req.body},{where:{id:id}
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message':'Successfully updated a customer',
                    'Updated customer': customer}, 200);
}

const deleteById = async(req, res) => {
    let err, customer;
    const id = req.params.id;
    [err, customer] = await to(Customer.destroy({
        where: {id:id}
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {'message': `Deleted customer ${id}`,
                    'Deleted customer': customer}, 200);
};

const getCustomerList = async (req, res) => {
    let limit = 10;
    let offset = 0;
    Customer.findAndCountAll()
    .then( data => {
        let page = req.params.page;
        let pages = Math.ceil(data.count / limit);
            offset = limit * (page -1);
        Customer.findAll({
            attributes: ['id','name','gender','address','itemId', 'locationId'],
            limit: limit,
            offset: offset,
            $sort: {id:1}
        })
        .then( customers => {
            res.status(200).json({'result': customers, 'count': data.count, 'pages':pages});
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
        gender: '',
        address: '',
        itemId:'',
        locationId:''
    }

    async function insert(json) {
        let err, customer;
        [err, customer] = await to(Customer.bulkCreate(json));
        if(err) return ReE(res, err, 500);

        return ReS(res, {
            message: 'Successfully imported CSV file',
            data: customer
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
    let err, customer;

    [err, customer] = await to(Customer.findAll({
        paranoid: false
    }));
    if(err) return ReE(res, err, 500);
    if(!customer) return ReE(res, {message:'No data to download'}, 400);

    customer = utils.clone(customer);

    const json2csv = require('json2csv').Parser;
    const parser = new json2csv({encoding:'utf-8', withBOM: true});
    const csv = parser.parse(customer);

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

    Customer.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('name'), ', ', db.sequelize.col('gender'),',', db.sequelize.col('address'),',', db.sequelize.col('itemId'),',', db.sequelize.col('locationId')), 'Filtered Result(s):'],
        ],
        where: condition,
        order: sort,
        paranoid: false
    }).then(customers => {
        res.send(customers);
    }).catch(err => {
        console.log(err);
    });
};

const search = async (req, res) => {
    const {
        id,
        name,
        gender,
        address,
        itemId,
        locationId
    } = req.query;
    [err, customers] = await to(Customer.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('name'),',', db.sequelize.col('gender'),',', db.sequelize.col('address'),',', db.sequelize.col('itemId'),',', db.sequelize.col('locationId')), 'Filtered:']
        ],
        where: {
            [Op.or]: [
                {id: {[Op.like]: '%' +id+ '%'}},
                {name: {[Op.like]: '%' +name+ '%'}},
                {gender: {[Op.like]: '%' +gender+ '%'}},
                {address: {[Op.like]: '%' +address+ '%'}},
                {itemId: {[Op.like]: '%' +itemId+ '%'}},
                {locationId: {[Op.like]: '%' +locationId+ '%'}},
            ]
        },
        paranoid:false,
        limit: 10
    }));
    
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        message: 'Searched: ',
        data: customers
    }, 200);
};



module.exports = {
    post,
    getAll,
    getOne,
    updateById,
    deleteById,
    getCustomerList,
    importcsv,
    exportcsv,
    filter,
    search
}
