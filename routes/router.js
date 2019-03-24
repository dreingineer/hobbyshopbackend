'use-strict';

const express = require('express');
const multer  = require('multer');

const router = express.Router();
const upload = multer({ dest: './uploads/'});

const shop = require('../controllers/shop-controller');

router.post('/shop/post',                           shop.post);
router.get('/shop/get',                             shop.getAll);
router.put('/shop/update/:id',                      shop.updateById);
router.delete('/shop/delete/:id',                   shop.deleteById);
router.get('/shop/get/:id',                         shop.getOne);
router.get('/shop/pagination/:page',                shop.getShopList);
router.get('/shop/export',                          shop.exportcsv);
router.post('/shop/import', upload.single('file') , shop.importcsv);
router.get('/shops/search',                         shop.search);


module.exports = router;
