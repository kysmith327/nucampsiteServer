const express = require('express');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite')
const cors = require('./cors');
const { mapReduce } = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
//GET- Done
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
//POST- Done
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
        .then(favorite => {
            if(favorite){
                req.body.forEach(element => {
                    if(!favorite.campsite.includes(element)){
                        favorite.campsite.push(element);
                    }
                })
                favorite.save()
                .then(fav => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
            
                })
                .catch(err => next(err));
            }else {
                Favorite.create({user: req.user._id, campsites: req.body})
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }       
        })
    .catch(err => next(err));
})
//Put- Unsupported- Done
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`Put operation not supported on /favorites`);
})
//Delete- Done
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findOneAndDelete(req.params.user)
    .then(favorites => {
        if (favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }
        else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));
})


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
//GET- Unsupported- Done
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
//POST- Done
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite){
            favorite.forEach(element => {
                if (element.campsiteId === req.body.campsiteId){
                    res.setHeader('Content-Type', 'plain/text');
                    res.res('That campsite is already in the list of favorites!')
                }else{
                    favorite.push(req.body);
                }
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
                
            })
            
        }else{
            Favorite.create({user: req.user._id, campsites: req.body})
            .then(element => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(element);
            })
            .catch(err => next(err));   
        }
    })
    .catch(err => next(err));
})
//PUT- Unsupported- Done
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
//DELETE- Done
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite){
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            if (index > -1){
                favorite.splice(index, 1);
            }
            favorite.save()
                .this(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            
        }else{
            res.setHeader('Content-Type', 'text/plain');
            res.end('There is no such item to delete');
        }
    })
    .catch(err => next(err));
})
