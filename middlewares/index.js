const jwt = require('jsonwebtoken');

const checkIfAuthenticated = function (req,res,next){
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        next(); //middleware always need a next to pass on to the next middleware
    }
}

const checkIfAuthenticatedJWT = function (req,res,next){
    const authHeader = req.headers.authorization;
    if(authHeader){
        //extract out the jwt and check if valid
        //example header authHeader => BEARER kjnAKJNinalknKJANSFsd
        const token = authHeader.split(' ')[1]; //split by space, take the index 1 which is jwt
        console.log(token)
        jwt.verify(token, process.env.TOKEN_SECRET, function(err,tokenData){
            // err argument is null if there is no error
            //token data arugment is the data we embed
            if(err){
                res.status(401);
                res.json({
                    'error': 'Invalid access token'
                })
            } else {
                // if token is valid
                req.user = tokenData;
                next();
            }
        })
    } else {
        res.status(401);
        res.json({
            'error': 'No authorization header found'
        })
    }
}

module.exports = {checkIfAuthenticated, checkIfAuthenticatedJWT}