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
    message.created_at = moment().unix();

    message.save((err, messageStored) => {
        if (err) { return res.status(500).send({ message: "Error a la hora de guardar el mensaje" }); }
        if (!messageStored) { return res.status(500).send({ message: "error al guardar / enviar el mensaje" }); }

        return res.status(200).send({ message: messageStored });

    });

}

module.exports = {
    prueba,
    saveMessage
}