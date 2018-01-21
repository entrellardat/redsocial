'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();

var md_auth = require('../middlewares/authenticated');

// rutas
api.get('/probando_md', md_auth.ensureAuth, MessageController.prueba);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);

module.exports = api;