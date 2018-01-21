'use strict'

// lo ponemos en mayusculas para indicar que es un modelo
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var moongosePaginate = require('mongoose-pagination');

var fs = require('fs');
var path = require('path');

// async await
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function home(req, res) {
    res.status(200).send({
        message: 'esto es una accion del controlador'
    });
}

function Pruebas(req, res) {
    res.status(200).send({
        message: 'esto es una accion del controlador'
    });
}

function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname &&
        params.nick && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        // controlar que no este dado ya de alta
        User.findOne({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {

            if (err) {
                return res.status(500).send({ message: 'Error en la peticion' });
            }

            if (users) {
                return res.status(200).send({
                    message: "El usuario que intenas regisrtar ya existe"
                });
            } else {
                // cifra y guarda los datos
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar el usaurio' });

                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'No se ha registro el usaurio' });
                        }
                    });
                });
            }
        });

    } else {
        res.status(200).send({
            message: "Envia todos los campos necesarios"
        });
    }
}


function loginUser(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;

    // esto es un and
    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    if (params.gettoken) {
                        //generar y  devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        })
                    } else {
                        //devolver datos de usaurio
                    }
                    user.password = undefined;
                    return res.status(200).send({ user });
                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido idenfiticar' });
                }
            });
        } else {
            return res.status(404).send({ message: 'El usuario no se ha podido idenfiticar!!' });
        }
    });
}

function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).send({
                message: "error en la peticion"
            });
        }

        if (!user) {
            return res.status(404).send({
                message: "El usuario no existe"
            });
        }

        // si nosotros como usaurio identificado seguimos al usaurio que nos llega por la URL
        followThisUser(req.user.sub, userId).then((value) => {
            return res.status(200).send({ user, value })
        });

    });

}

// async para definirla como asincrona [devuelve una promesa]
async function followThisUser(identity_user_id, user_id) {
    try {
        var following = await Follow.findOne({ user: identity_user_id, followed: user_id }).exec()
            .then((following) => {
                console.log(following);
                return following;
            })
            .catch((err) => {
                return handleerror(err);
            });
        var followed = await Follow.findOne({ user: user_id, followed: identity_user_id }).exec()
            .then((followed) => {
                console.log(followed);
                return followed;
            })
            .catch((err) => {
                return handleerror(err);
            });
        return {
            following: following,
            followed: followed
        }
    } catch (e) {
        console.log(e);
    }
}


async function followUsersIds(user_id) {

    var following = await Follow.find({ 'user': user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec((err, follows) => {
        return follows;
    });

    var followed = await Follow.find({ 'followed': user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec((err, follows) => {
        console.log(follows);
    });

    var followed_clean = [];

    followed.forEach((follow) => {
        followed_clean.push(follow.user);
    });

    var following_clean = [];

    following.forEach((follow) => {
        following_clean.push(follow.followed);
    });

    return {
        following: following_clean,
        followed: followed_clean
    }


}

function getUsers(req, res) {
    var identity_user_id = req.user.sub;
    var page = 1;
    // si nos llega este parametro
    if (req.params.page) {
        page = req.params.page
    }

    console.log('usuario que realiza la peticion:' + req.user.sub);

    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) {
            return res.status(500).send({
                message: "error en la peticion"
            });
        }

        if (!users) {
            return res.status(404).send({
                message: "No hay usuarios en la plataforma"
            });
        }

        followUsersIds(identity_user_id).then((value) => {
            console.log(value);
            return res.status(200).send({
                users,
                total,
                pages: Math.ceil((total / itemsPerPage)),
                users_following: value.following,
                users_follow_me: value.followed
            });
        });

    });

}


function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    // borrar la propiedad password
    delete update.password;

    // si el id del usaurio identificado es distinto del que nos llega por url
    if (userId != req.user.sub) {
        return res.status(500).send({
            message: "No tienes permiso para actualziar los datos del usuario"
        });
    }

    // new : true --> te devuelve el objeto actualizado

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
        if (err) {
            return res.status(500).send({
                message: "error en la peticion"
            });
        }

        if (!userUpdate) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

        return res.status(200).send({ user: userUpdate });

    });
}


// funcion auxukiar

function removefilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        if (err) return res.status(200).send({ message: message })
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;


    // existe en el request cuabndo mandas archivos
    if (req.files) {

        var file_path = req.files.image.path;
        console.log(file_path);

        var file_split = file_path.split('\\');
        console.log(file_split);

        var file_name = file_split[2];
        console.log(file_name);

        var ext_split = file_name.split('\.');
        console.log(ext_split);

        var file_ext = ext_split[1];
        console.log(file_ext);

        if (userId != req.user.sub) {
            return removefilesOfUploads(res, file_path, "No tienes permiso para actualziar los datos del usuario");
        }


        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // actualizar documento de usuario logueado
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdate) => {
                if (err) {
                    return res.status(500).send({
                        message: "error en la peticion"
                    });
                }

                if (!userUpdate) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

                return res.status(200).send({ user: userUpdate });
            });
        } else {
            // borrado de fichreo
            return removefilesOfUploads(res, file_path, 'Extension no valida');
        }

    } else {
        return res.status(200).send({ message: 'No se han subido archivos' });
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users/' + imageFile;

    fs.exists(path_file, (exists) => {
        if (exists) {
            return res.sendFile(path.resolve(path_file));
        } else {
            return res.status(200).send({
                message: 'No existe la imagen'
            });
        }
    });

}

function getCounters(req, res) {
    var userId = req.user.sub;
    if (req.params.id) {
        userId = req.params.id;
    }
    getCountFollow(userId).then((value) => {
        return res.status(200).send(value);
    });
}

async function getCountFollow(user_id) {
    var following = await Follow.count({ user: user_id }).exec((err, count) => {
        if (err)
            return handleerror(err);
        else {
            return count;
        }
    });

    var followed = await Follow.count({ followed: user_id }).exec((err, count) => {
        if (err) {
            return handleerror(err);
        } else
            return count;
    });

    var publications = await Publication.count({ user: user_id }).exec((err, count) => {
        if (err) {
            return handleerror(err);
        } else
            return count;
    });

    console.log(following);

    return {
        following: following,
        followed: followed,
        publications: publications
    }

}


module.exports = {
    home,
    Pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile,
    getCounters
}