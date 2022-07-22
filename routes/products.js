const express = require("express");
const { route } = require("./landing");
const router = express.Router();

router.get('/', function(req,res){
    res.render("products/index");
});

router.get('/create', function(req,res){
    res.render("products/create");
})

module.exports = router;