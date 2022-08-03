const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const generateAccessToken = function (username, id, email, tokenSecret, expiry) {
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

const { User, BlacklistedToken } = require('../../models');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

router.post('/login', async function (req, res) {
    const user = await User.where({
        'email': req.body.email,
        'password': getHashedPassword(req.body.password)
    }).fetch({
        require: false
    })

    if (user) {
        //create the jwt
        const accessToken = generateAccessToken(user.get('username'), user.get('id'), user.get('email'), process.env.TOKEN_SECRET, '1h')
        const refreshToken = generateAccessToken(user.get('username'), user.get('id'), user.get('email'), process.env.REFRESH_TOKEN_SECRET, '7d')
        res.json({
            'accessToken': accessToken,
            'refreshToken': refreshToken
        })
    } else {
        //error
        res.status(401);
        res.json({
            'message': 'Invalid email or password'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, function (req, res) {
    const user = req.user;
    res.json({
        "user": user
    })
})

//get a new access token
router.post('/refresh', async function (req, res) {
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
        //check if token is already blacklist
        const blacklistedToken = await BlacklistedToken.where({
            'token': refreshToken
        }).fetch({
            require: false
        })

        //if the blaclisted token is not null, means it exists
        if(blacklistedToken){
            res.status(400);
            res.json({
                'error': 'Refresh token has been blacklisted'
            })
            return;
        }

        //verify if legit
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function (err, tokenData) {
            if (!err) {
                //generate a new access token and send back
                const accessToken = generateAccessToken(tokenData.userName,
                    tokenData.id,
                    tokenData.email,
                    process.env.TOKEN_SECRET,
                    '1h');
                res.json({
                    accessToken: accessToken
                })
            } else {
                res.status(401);
                res.json({
                    'error': 'No token found'
                })
            }
        })
    } else {
        res.status(401);
        res.json({
            'error': 'No refresh token found'
        })
    }
})

router.post('/logout', async function(req,res){
    const refreshToken = req.body.refreshToken;

    if(refreshToken){
        //add refresh token to black list
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async function(err, tokenData){
            if (!err){
                //check if token is already blacklist
                const blacklistedToken = await BlacklistedToken.where({
                    'token': refreshToken
                }).fetch({
                    require: false
                })

                //if the blaclisted token is not null, means it exists
                if(blacklistedToken){
                    res.status(400);
                    res.json({
                        'error': 'Refresh token has been blacklisted'
                    })
                    return;
                }

                // add to blacklist
                const token = new BlacklistedToken();
                token.set('token', refreshToken);
                token.get('date_created', new Date());
                await token.save();
                res.json({
                    'message': 'logged out'
                })
            }
        })
    } else {
        res.status(401);
        res.json({
            'error': 'No refresh token found'
        })
    }
})

module.exports = router