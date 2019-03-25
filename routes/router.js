'use-strict';

const express = require('express');
const multer  = require('multer');

const router = express.Router();
const upload = multer({ dest: './uploads/'});

const shop = require('../controllers/shop-controller');
const location = require('../controllers/location-controller');

router.post('/shop/post',                               shop.post);
router.get('/shop/get',                                 shop.getAll);
router.put('/shop/update/:id',                          shop.updateById);
router.delete('/shop/delete/:id',                       shop.deleteById);
router.get('/shop/get/:id',                             shop.getOne);
router.get('/shop/pagination/:page',                    shop.getShopList);
router.get('/shop/export',                              shop.exportcsv);
router.post('/shop/import', upload.single('file') ,     shop.importcsv);
router.get('/shops/filter',                             shop.filter);
router.get('/shops/search',                             shop.search);

router.post('/location/post',                           location.post);
router.get('/location/get',                             location.getAll);
router.put('/location/update/:id',                      location.updateById);
router.delete('/location/delete/:id',                   location.deleteById);
router.get('/location/get/:id',                         location.getOne);
router.get('/location/pagination/:page',                location.getLocationList);
router.get('/location/export',                          location.exportcsv);
router.post('/location/import', upload.single('file'),  location.importcsv);
router.get('/locations/filter',                         location.filter);
router.get('/locations/search',                         location.search);






module.exports = router;
