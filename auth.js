const bcrypt = require( 'bcrypt' );
const express = require( 'express' );
const User = require( './models' ).User;
const database = require( './database' );
const File = require( './models' ).File;

const router = new express.Router();

router.post('/signup', function( req, res ) {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const name = req.body.name;

    User.findOne({ where: { email: email } }).then(function( user ) {

        if ( user !== null ) {
            req.flash( 'signUpMessage', 'Email is already in use.' );
            return res.redirect( '/' );
        }
        
        if ( password !== confirmPassword ) {
            req.flash( 'signUpMessage', 'Passwords do not match.' );
            return res.redirect( '/' );
        }

        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync( password, salt );
        
        User.create({
            email: email,
            password: hashedPassword,
            salt: salt,
            name: name
        }).then(function( response ) {
            const data = response.get({ plain: true });
            console.log("this is the data", data);

            File.findAll({ where: { user_id: data.id } }).then(function( results ) {
                return res.render('profile.html', {
                    files: results,
                    user: data
                });
            });
        });

    });
});


router.post('/signin',  function( req, res ) {
    const email = req.body.email;
    const password = req.body.password;
    const remember = req.body.remember;
    const MAXAGE = 1000 * 60 * 60;

    User.findOne({ where: { email: email } }).then(function( user ) {
        if ( user === null ) {
            req.flash( 'signInMessage', 'Incorrect email.' );
            return res.redirect( '/' );
        }

        const match = bcrypt.compareSync( password, user.password );
        
        if ( !match ) {
            req.flash( 'signInMessage', 'Incorrect password.' );
            return res.redirect( '/' );
        }

        req.flash( 'statusMessage', 'Signed in successfully!' );
        req.session.currentUser = user.email;

        if ( remember ) {
            req.session.cookie.maxAge = MAXAGE;
        }

        res.redirect( '/profile' );
    });
});


router.get('/signout', function( req, res ) {
    req.session.destroy();
    res.redirect( '/' );
});

module.exports = router;
