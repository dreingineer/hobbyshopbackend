const __ = require('lodash');
const Sequelize = require('sequelize');
const Models = require('../models');

const Settings = require('./settings');

const Op = Sequelize.Op;

const Province = Models.Province;
const Region = Models.Region;
const Municipality = Models.Municipality;

const getModule = (moduleName) => {
    const name = moduleName;
    switch(name) {
        case 'Region' :
            return {
                model: Region,
                before: [],
                after: [],
                table: [],
                'include' : [],
                'fields' : [
                    {label:'Name', value:'name'},
                    {label:'Code', value:'code'},
                ],
                relatedModels: [
                    {model: Province, id: 'regionId'},
                ],
                headers: [
                    'Name',
                    'Code'
                ]
            };
        case 'Province' : 
            return {
                model: Province,
                before: [],
                after: [],
                table: [],
                'include' : [],
                'fields' : [
                    {label:'Name', value:'name'},
                    {label:'Code', value:'code'},
                    {label:'RegionId', value:'regionId'}
                ],
                relatedModels: [
                    {model: Region, id: 'regionId'},
                    {model: Municipality, id: 'provinceId'}
                ],
                headers: [
                    'Name',
                    'Code',
                    'RegionId'
                ]
            };
        case 'Municipality' :
            return {
                model: Municipality,
                before: [],
                after: [],
                table: [],
                'include' : [],
                'fields' : [
                    {label:'Name', value:'name'},
                    {label:'Code', value:'code'},
                    {label:'ProvinceId', value:'provinceId'}
                ],
                relatedModels: [
                    {model: Province, id: 'provinceId'},
                ],
                headers: [
                    'Name',
                    'Code',
                    'ProvinceId'

                ]
            };
        default: return null;
    }
}

module.exports = {
    'getModule': getModule
}
