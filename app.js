require('./global_functions');

const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const volleyball = require('volleyball');
const models = require('./models');

const routes = require('./routes/router');

// middleware for logging
app.use(volleyball);

// middleware for parsing
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({'extended':true}));

app.use('/', routes);

// default route
app.use('*', (req, res, next) => {
    res.send('nothing in this route.');
});

const server = app.listen(9000, () => {
    console.log('Listening on port', server.address().port);
});
