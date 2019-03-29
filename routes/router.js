'use-strict';

const express = require('express');
const multer  = require('multer');

const router = express.Router();
const upload = multer({ dest: './uploads/'});

const shop = require('../controllers/shop-controller');
const location = require('../controllers/location-controller');
const brand = require('../controllers/brand-controller');
const category = require('../controllers/category-controller');
const item = require('../controllers/item-controller');
const customer = require('../controllers/customer-controller');

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

router.post('/brand/post',                              brand.post);
router.get('/brand/get',                                brand.getAll);
router.put('/brand/update/:id',                         brand.updateById);
router.delete('/brand/delete/:id',                      brand.deleteById);
router.get('/brand/get/:id',                            brand.getOne);
router.get('/brand/pagination/:page',                   brand.getBrandList);
router.get('/brand/export',                             brand.exportcsv);
router.post('/brand/import', upload.single('file'),     brand.importcsv);
router.get('/brands/filter',                            brand.filter);
router.get('/brands/search',                            brand.search);

router.post('/category/post',                           category.post);
router.get('/category/get',                             category.getAll);
router.put('/category/update/:id',                      category.updateById);
router.delete('/category/delete/:id',                   category.deleteById);
router.get('/category/get/:id',                         category.getOne);
router.get('/category/pagination/:id',                  category.getCategoryList);
router.get('/category/export',                          category.exportcsv);
router.post('/category/import', upload.single('file'),  category.importcsv);
router.get('/categories/filter',                        category.filter);
router.get('/categories/search',                        category.search);

router.post('/item/post',                               item.post);
router.get('/item/get',                                 item.getAll);
router.put('/item/update/:id',                          item.updateById);
router.delete('/item/delete/:id',                       item.deleteById);
router.get('/item/get/:id',                             item.getOne);
router.get('/item/pagination/:id',                      item.getItemList);
router.get('/item/export',                              item.exportcsv);
router.post('/item/import', upload.single('file'),      item.importcsv);
router.get('/items/filter',                             item.filter);
router.get('/item/search',                              item.search);

router.post('/customer/post',                           customer.post);
router.get('/customer/get',                             customer.getAll);
router.get('/customer/get/:id',                         customer.getOne);
router.put('/customer/update/:id',                      customer.updateById);
router.delete('/customer/delete/:id',                   customer.deleteById);
router.get('/customer/pagination/:id',                  customer.getCustomerList);
router.get('/customer/export',                          customer.exportcsv);
router.post('/customer/import', upload.single('file'),  customer.importcsv);
router.get('/customers/filter',                         customer.filter);
router.get('/customers/search',                         customer.search);
// add a new items to a customer
router.put('/customer/:id/item',                        customer.addItems);


module.exports = router;
