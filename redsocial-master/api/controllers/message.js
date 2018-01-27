'use strict'

var moment = require('moment');
var moongosePaginate = require('mongoose-pagination');

// Modelos
var User = require('../models/user');
var Message = require('../models/message');
var Follow = require('../models/follow');

function prueba(req, res) {
    return res.status(200).send({
        message: 'Hola , ¿que tal?'
    });
}

function saveMessage(req, res) {
    var params = req.body;

    if (!params.text || !params.reciever) {
        return res.status(200).send({
            message: "Envia los datos necesaraios"
        });
    }

    var message = new Message();
    message.emitter = req.user.sub;
    message.reciever = params.reciever;
    message.text = params.text;
    message.viewed = 'false';
    message.created_at = moment().unix();

    message.save((err, messageStored) => {
        if (err) { return res.status(500).send({ message: "Error a la hora de guardar el mensaje" }); }
        if (!messageStored) { return res.status(500).send({ message: "error al guardar / enviar el mensaje" }); }

        return res.status(200).send({ message: messageStored });

    });
}

function getRecievedMessage(req, res) {
    var userId = req.user.sub; // id del usuario logueado
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ reciever: userId }).populate('emitter', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) { return res.status(500).send({ message: "Error en la peticion" }); }
        if (!messages) { return res.status(404).send({ message: "No hay mensajes" }); }

        return res.status(200).send({
            tota: total,
            pages: Math.ceil(messages / itemsPerPage),
            messages
        });
    });
}

function getEmmitMessages(req, res) {
    var userId = req.user.sub; // id del usuario logueado
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ emitter: userId }).populate('emitter reciever', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) { return res.status(500).send({ message: "Error en la peticion" }); }
        if (!messages) { return res.status(404).send({ message: "No hay mensajes" }); }

        return res.status(200).send({
            tota: total,
            pages: Math.ceil(messages / itemsPerPage),
            messages
        });
    });
}

function getUnviewedMessages(req, res) {
    var userId = req.user.sub;
    Message.count({ reciever: userId, viewed: false }).exec((err, count) => {
        if (err) { return res.status(500).send({ message: "Error en la peticion" }); }

        return res.status(200).send({
            'unviewed': count
        });

    });
}

function setViewedMessages(req, res) {
    var userId = req.user.sub;
    Message.update({ reciever: userId, viewed: 'false' }, { viewed: 'true' }, { "multi": true }, (err, messagesUpdate) => {
        if (err) { return res.status(500).send({ message: "Error en la peticion" }); }
        return res.status(200).send({
            messages: messagesUpdate
        });
    });
}

module.exports = {
    prueba,
    saveMessage,
    getRecievedMessage,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages
}