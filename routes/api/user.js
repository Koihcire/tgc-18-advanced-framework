const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const generateAccessToken = function (username,id,email,tokenSecret,expiry){
    //first arg == payload (public can see)
    //second arg == tokensecret
    return jwt.sign({
        'username': username,
        'id': id,
        'email': email
    }, tokenSecret, {
        expiresIn: expiry
    })
}

const {User} = require('../../models');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

router.post('/login', async function(req,res){
    const user = await User.where({
        'email': req.body.email,
        'password': getHashedPassword(req.body.password)
    }).fetch({
        require: false
    })

    if(user){
        //create the jwt
        const accessToken = generateAccessToken(user.get('username'), user.get('id'), user.get('email'), process.env.TOKEN_SECRET, '1h')
        res.json({
            'accessToken': accessToken
        })
    } else {
        //error
        res.status(401);
        res.json({
            'message': 'Invalid email or password'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, function(req,res){
    const user = req.user;
    res.json({
        "user": user
    })
})

module.exports = router