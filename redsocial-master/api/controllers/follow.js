'use strict'

var moongosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function prueba(req, res) {
    return res.status(200).send({
        message: 'hola mundo desde el controlador follows'
    });
}

function saveFollow(req, res) {
    var params = req.body;
    var follow = new Follow();
    // el middleware monta todos los datos de usuario
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, userStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar el siguimiento' });

        if (!userStored) {
            return res.status(404).send({
                message: 'El seguimiento no se ha guardado'
            });
        }

        console.log({ 'userStored': userStored });
        return res.status(200).send({ follow: userStored });

    });
}

function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id; // se le pasa por la URL

    Follow.find({ 'user': userId, 'followed': followId }).remove(err => { message: 'error al dejar de seguid' });

    return res.status(200).send({ meesage: ' El follow se ha eliminado' });

}

function getFollowingUsers(req, res) {
    var userId = req.user.sub;

    // Tenemos que distinguis si nos llega un usuario por URL o no
    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });

        if (!follows) return res.status(404).send({ message: 'No hay followers' });

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        });
    });

}

// Los usaurios que nos estan siguiendo paginados
function getFollowedUsers(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    var itemsPerPage = 4;

    Follow.find({ followed: userId }).populate('user followed').paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });

        if (!follows) return res.status(404).send({ message: 'No hay followers' });

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        });
    });
}


//devolver listado de usaurios
function getMyFollows(req, res) {
    var userId = req.user.sub;

    // los usaurios que yo sigo
    var find = Follow.find({ user: userId });

    // si viene este parametro (con mi id) me sacaria los usuarios que me estan siguiendo
    if (req.params.followed) {
        find = Follow.find({ followed: userId });
    }

    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });

        if (!follows) return res.status(404).send({ message: 'No sigues a ningun usuario' });

        return res.status(200).send({ follows });
    });
}


module.exports = {
    prueba,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}