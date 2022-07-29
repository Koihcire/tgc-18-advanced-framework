const express = require("express");
const router = express.Router();
const crypto = require('crypto');

// import in the User model
const { User } = require('../models');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const { createUserForm, bootstrapField, createLoginForm } = require('../forms');
const { route } = require("./landing");

router.get('/signup', (req, res) => {
    // display the registration form
    const userForm = createUserForm();
    res.render('users/signup', {
        'form': userForm.toHTML(bootstrapField)
    })
})

router.post('/signup', async (req, res) => {
    const userForm = createUserForm();
    userForm.handle(req, {
        success: async (form) => {
            const user = new User({
                'username': form.data.username,
                'password': getHashedPassword(form.data.password),
                'email': form.data.email
            });
            await user.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/signup', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', async function (req, res) {
    const loginForm = createLoginForm();
    res.render('users/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // process the login
            // ...find the user by email and password
            const user = await User.where({
                'email': form.data.email,
                'password': getHashedPassword(form.data.password)
            }).fetch({
                require: false
            }
            );

            //check if the user does not exist
            if (!user) {
                req.flash("error_messages", "Sorry, wrong email or password.")
                res.redirect('/users/login');
            } else {
                // store the user details
                req.session.user = {
                    id: user.get('id'),
                    username: user.get('username'),
                    email: user.get('email')
                }
                req.flash("success_messages", "Welcome back, " + user.get('username'));
                res.redirect('/users/profile');
            }
        },
        'error': async (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please fill in the form again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }

    });
})

router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        res.render('users/profile',{
            'user': user
        })
    }
})

router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "You have been logged out");
    res.redirect('/users/login');
})

module.exports = router;