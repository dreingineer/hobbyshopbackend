const db = require('../models/index');
const utils = require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sorter = require('../helpers/sorter');

const Location = db.Location;

// post a location
const post = async (req, res) => {
    res.setHeader('Content-type','application/json');
    const {
        address,
        zip
    } = req.body;
    let err, location;
    [err, location] = await to(Location.create({
        'address': address,
        'zip': zip
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        'message': 'Successfully added a location',
        'Created Location': location
    },200);
};

// get all locations
const getAll = async (req, res) => {
    res.setHeader('Content-type','application/json');
    [err, locations] = await to(Location.findAll({
        paranoid: false
    }));
    return ReS(res, {
        'All Locations': locations
    });
};

// get location by id
const getOne = async (req, res) => {
    res.setHeader('Content-type','application/json');
    const id = req.params.id;
    [err, location] = await to(Location.findByPk(id));
    if(err) return ReE(res,err,500);
    return ReS(res, {
        'Location':location
    }, 200);
};

// update a location
const updateById = async (req, res) => {
    const id = req.params.id;
    let err, location;
    [err, location] = await to(Location.update({...req.body}, {
        where: {
            id: id
        }
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        'message':'Succesfully updated a location',
        'Updated Location': location
    }, 200);
};

// delete a location
const deleteById = async(req, res) => {
    let err, location;
    const id = req.params.id;
    [err, location] = await to(Location.destroy({
        where: {
            id: id
        }
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        'message': `Deleted location ${id}`,
        'Deleted location': location
    }, 200);
};

// location pagination
const getLocationList = async(req, res) => {
    let limit = 10; // limit per page
    let offset = 0;
    Location.findAndCountAll()
    .then( data => {
        let page = req.params.page;
        let pages = Math.ceil(data.count / limit);
            offset = limit * (page -1);
        Location.findAll({
            attributes: ['id','address','zip'],
            limit: limit,
            offset: offset,
            $sort: { id: 1}
        })
        .then( locs => {
            res.status(200).json({'Pagination Result': locs, 'count': data.count, 'pages': pages});
        });
    })
    .catch( err => {
        res.status(500).send('Internal server error');
    });
};

// import csv for location
const importcsv = async (req, res) => {
    const file = req.file ? req.file.path : null;
    console.log('File', file);
    if(!file) return ReE(res, { message: 'CSV file not found'}, 400);

    const csv = require('../helpers/csv_validator');

    const headers = {
        // owner: '',
        // founded: '',
        // locationId:''
        address: '',
        zip:''
    }

    async function insert(json) {
        let err, location;
        [err, location] = await to(Location.bulkCreate(json));
        if(err) return ReE(res, err, 500);

        return ReS(res, {
            message: 'Successfully imported CSV file',
            data: location
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

// export locations
const exportcsv = async (req, res) => {
    let err, locations;
    [err, locations] = await to(Shop.findAll({
        paranoid:false
    }));
    if(err) return ReE(res, err, 500);
    if(!locations) return ReE(res, {'message':'No data to download'}, 400);

    locations = utils.clone(locations);

    const json2csv = require('json2csv').Parser;
    const parser = new json2csv({encoding:'utf-8', withBOM:true});
    const csv = parser.parse(locations);

    res.setHeader('Content-disposition','attachment; filename=Location.csv');
    res.set('Content-type','text/csv');
    res.send(csv);
}

// search filter locations (exact match)
const filter = async (req, res) => {
    let reqQuery = req.query;
    let reqQuery_Sort = req.query.sortBy;
    let condition = {};
    let sort = [];

    if(Object.keys(reqQuery).length > 0) {
        if(reqQuery_Sort) {
            sort = await sorter.convertToArrSort(reqQuery_Sort);
            delete reqQuery.sortBy;
        }
        condition = reqQuery;
    }

    Location.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('address'),',', db.sequelize.col('zip')), 'Result(s): '],
        ],
        where: condition,
        order: sort,
        paranoid: false
    })
    .then(locs => {
        res.send(locs);
    })
    .catch(err => {
        console.log(err);
    });
};

// search like locations 
const search = async (req, res) => {
    const {
        id,
        address,
        zip
    } = req.query;
    [err, locations] = await to(Location.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('address'),',', db.sequelize.col('zip')), 'Searched: ']
        ],
        where: {
            [Op.or]: [
                {id: {[Op.like]: '%'+id+'%'}},
                {address: {[Op.like]: '%'+address+'%'}},
                {zip: {[Op.like]: '%'+zip+'%'}}
            ]
        },
        paranoid: false,
        limit: 10
    }));

    if(err) return ReE(res, err, 500);
    return ReS(res, {
        message: 'Searched: ',
        data: locations
    }, 200);
};

module.exports = {
    post,
    getAll,
    getOne,
    updateById,
    deleteById,
    getLocationList,
    importcsv,
    exportcsv,
    filter,
    search
}
