'use strict'

var moongose = require('mongoose');
var app = require('./app');
var port = 27017;

// conexion  base d datos
moongose.promise = global.Promise;
moongose.connect('mongodb://localhost:27017/curso_mean_social', { useMongoClient: true, socketTimeoutMS: 300000 })
    .then(() => {
        console.log("la conexion a la base de datos curso_mean_social se ha realizado correctamente");
        // crear el servidor web
        app.listen(port, () => {
            console.log('servidor corriendo en http://localhost:27017');
        })
    })
    .catch(err => console.log(err));