'use strict'

// librerias
var moongosePaginate = require('mongoose-pagination');
var path = require('fs');
var moment = require('moment');

// imports modelos
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req, res) {
    res.status(200).send({
        message: "Hola desde el controlador de publicaciones"
    });
}

function savePublication(req, res) {
    var params = req.body;
    var publication = new Publication();

    if (!params.text) {
        return res.status(200).send({ message: 'debes enviar un texto' });
    }

    publication.text = params.text;
    publication.file = null;
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicationStore) => {
        if (err) {
            res.status(500).send({
                message: "error al guardar la publicacion"
            });
        }

        if (!publicationStore) {
            res.status(500).send({
                message: "la publicacion no ha sido guardada"
            });
        }

        return res.status(200).send({ publication: publicationStore });

    });
}

function getPublications(req, res) {
    // recoger el parametro page
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) {
            if (err) {
                res.status(500).send({
                    message: "Error al devolver el seguimiento"
                });
            }
        }

        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        //$in : esto va a buscar todos los usaurios que esten denrto del array follows_clean
        Publication.find({ user: { "$in": follows_clean } }).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if (err) { res.status(500).send({ message: "Error al devolver las publicaciones" }); }
            if (!publications) { res.status(404).send({ message: "No hay publicaciones" }); }

            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total / itemsPerPage),
                page: page,
                publications
            })

        });

    });

}

function getPublication(req, res) {
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if (err) { res.status(500).send({ message: "Error al devolver las publicaciones" }); }

        if (!publication) { res.status(404).send({ message: "No existe publicacion" }); }

        return res.status(200).send({ publication });
    });

}

function deletePublication(req, res) {
    var publicationId = req.params.id;

    Publication.find({ user: req.user.sub, '_id': publicationId }).remove(err => {
        if (err) { return res.status(500).send({ message: "Error al devolver las publicaciones" }); }
        //if (!publicationRemoved) { return res.status(404).send({ message: "No existe la publicacion" }); }
        return res.status(200).send({ message: "publicacion eliminada" });
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;

    return res.status(200).send({
        message: req.files
    });

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

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // actualizar documento de usuario logueado

            Publication.findOne({ 'user': req.user.sub, '_id': publicationId }).exec((err, publication) => {
                if (publication) {
                    Publication.findByIdAndUpdate(publicationId, { image: file_name }, { new: true }, (err, publicationUpdate) => {
                        if (err) {
                            return res.status(500).send({
                                message: "error en la peticion"
                            });
                        }

                        if (!publicationUpdate) return res.status(404).send({ message: 'No se ha podido actualizar la publicacion' });

                        return res.status(200).send({ publication: publicationUpdate });
                    });
                } else {
                    return removefilesOfUploads(res, file_path, 'no tienes permiso para actualzar');
                }
            })
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
    var path_file = './uploads/publications/' + imageFile;

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


module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}