const express = require('express');
const bodyParser = require('body-parser');
const Favorites =require('../models/favorite')
var authenticate = require('../authenticate');
const cors = require('../cors');
const user = require('../models/user');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/favorite')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.find({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            // extract favourites that match the req.user.id
            if (favourites) {
                user_favourites = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user_favourites) {
                    var err = new Error('You have no favourites!');
                    err.status = 404;
                    return next(err);
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(user_favourites);
            } else {
                var err = new Error('There are no favourites');
                err.status = 404;
                return next(err);
            }
            
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.find({})
    .populate('user')
    .populate('dishes')
    .then((favourites) => {
        var user;
        if(favourites.length){
            user = favourites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];
        }
        if(!user) 
            user = new Favorites({user: req.user._id});
            for(let i of req.body){
                if(user.dishes.find((d_id) => {
                    if(d_id._id){
                        return d_id._id.toString() === i._id.toString();
                    }
                }))
                    continue;
                user.dishes.push(i._id);
            }
            user.save()
                .then((userFavs) => {
                    res.statusCode = 201;
                    res.setHeader("Content-Type", "application/json");
                    res.json(userFavs);
                    console.log("Favourites Created");
                }, (err) => next(err))
                .catch((err) => next(err));
            
        })
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favourites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                var favToRemove;
                if (favourites) {
                    favToRemove = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                } 
                if(favToRemove){
                    favToRemove.remove()
                        .then((result) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(result);
                        }, (err) => next(err));
                    
                } else {
                    var err = new Error('You do not have any favourites');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });
    favoriteRouter.route('/favorite/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
        Favorites.find({})
        .populate('user')
        .populate('dishes')
        .then((favorite)=>{
            const id=req.params.dishId;
            const user=favorite.filter((dish)=>dish.user._id.toString()===req.user._id.toString())[0];
            console.log(user)
            if(user){
                const favDis=user.dishes.filter((dish)=>dish._id.toString()===id)[0];
                if(favDis){
                    res.statusCode=200;
                    res.json(favDis);
                }else{
                    var err = new Error('You do not have any favourites');
                    err.status = 404;
                    return next(err);
                }      
            }else{
                   var err = new Error('You do not have any favourites');
                    err.status = 404;
                    return next(err);
            }
            
            
        },err=>next(err))
        .catch(err=>next(err))
    })
    .post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
        var id =req.params.dishId;
        Favorites.find({})
        .populate('user')
        .populate('dish')
        .then((favorites)=>{
            if(favorites.length)
            var favorite = favorites.filter((user)=>user.user._id.toString()===req.user._id.toString())[0];
            if(favorite){
                console.log(favorite.dishes.indexOf(id))
               if(favorite.dishes.indexOf(id)===-1){
                    favorite.dishes.push(id);
                    favorite .save()
                 .then(dish=>{
                    res.statusCode = 201;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                    console.log("Favourites added");
                 },err=>next(err))
                }
               else{
                   res.statusCode=400;
                   var err=new Error('Item already in your favourite');
                    return next(err)
               }
            }else{
                var user=new Favorites({user:req.user._id});
                 user.dishes.push(id)
                 user.save()
                 .then(dish=>{
                    res.statusCode = 201;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                    console.log("Favourites Created");
                 },err=>next(err))
            }
        }).catch(err=>next(err))

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favourites/:dishId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
        .populate('user')
        .populate('dish')
        .then((favorites)=>{
             if(favorites.length){
             var favorite = favorites.filter((user)=>user.user._id.toString()===req.user._id.toString())[0];
             if(favorite){
                favorite.dishes=favorite.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId)
                favorite.save()
                .then((result) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(result);
                }, (err) => next(err));
              }else{
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
              }
             }else{
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
             }
             
        })

    })
    module.exports=favoriteRouter;
