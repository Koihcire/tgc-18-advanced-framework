const checkIfAuthenticated = function (req,res,next){
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        next(); //middleware always need a next to pass on to the next middleware
    }
}

module.exports = {checkIfAuthenticated}