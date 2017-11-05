const express = require( 'express' );
const database = require( './database' );
const File = require( './models' ).File;
const User = require( './models' ).User;
const Comment = require( './models' ).Comment;
const flash = require( 'express-flash' );
const consolidate = require( 'consolidate' );
const cookieparser = require( 'cookie-parser' );
const session = require( 'express-session' );
const middlewares = require( 'middlewares' );
const multer = require( 'multer' );
const path = require( 'path' );

var bodyparser = require( 'body-parser' );
var app = express();

app.engine('html', consolidate.nunjucks);
app.set('views', './views');

app.use(bodyparser.urlencoded( { extended: true } ));
app.use(cookieparser( 'secret-cookie' ));
app.use(session( { resave: false, saveUninitialized: false, secret: 'secret-cookie' } ));
app.use(flash());
app.use('/static', express.static( './static' ));
app.use('/avatars', express.static( './avatar_pics' ));
app.use('/uploads', express.static( './uploads' ));
app.use(require( './auth' ));

var user = function retrieveSignedInUser( req, res, next ) {
    const email = req.session.currentUser;

    User.findOne( { where: { email: email } } ).then(function( user ) {
    	req.user = user;
    	next();
    });
}

app.use( user );

// displays the profile of the currently signed in user
app.get('/profile', requireSignedIn, function( req, res ) {
	const email = req.user.email;

	User.findOne( { where: {email:email} } ).then(function( user ) {
		File.findAll({ where: { user_id: req.user.id } }).then(function( results ) {
			res.render('profile.html', {
				files: results,
				user: user
			});
		});
	});
});

// displays the comments about a particular file
app.get('/comments', requireSignedIn, function( req, res ) {
	
	File.findOne( { where: { id: req.query.id } } ).then(function( file ) {
		Comment.findAll({ where: { file_id: req.query.id } }).then(function( results ) {
			res.render('comments.html', {
				comments: results,
				file_id: req.query.id,
				user: req.user.name,
				file: file
			});
		});
	});
});

// displays the default or the index page
app.get('/', function( req, res ) {
	res.render( 'index.html' );
});

// gets the course page
app.get('/course', requireSignedIn, function( req, res ) {
	const ALL = "ALL";
	
	// if the user either does not specify a specific course code or chooses all courses
	if ( !req.query.course_code || req.query.course_code == ALL ){
		File.findAll().then(function( results ) {
			res.render('course.html', {
				files: results
			});
		});
	} else {
		File.findAll({ where: { course: req.query.course_code } }).then(function( results ) {
			res.render('course.html', {
				files: results
			});
		});
	}	
});

// enables the user to post a comment
app.post('/postcomment', requireSignedIn, function( req, res ) {
    Comment.create({
        name: req.body.name,
        content: req.body.content,
        file_id: req.body.file_id
    }).then(function( response ) {
        return res.redirect( '/comments' + '?id=' + req.body.file_id );
    });
});

// enables the user to delete a file
app.post('/delete', requireSignedIn, function( req, res ) {
	File.destroy({
	    where: {
	       id:req.body.id
	    }
	}).then(function( results ) {
		res.redirect( '/profile' );
	});
});


const avatarpic = multer({ dest: './avatar_pics' }) // object that contains the avatar file name and destination

// enables the user to upload an avatar profile photo
app.post('/upload-avatar', requireSignedIn, avatarpic.single( 'avatar' ), function( req, res ){
	const email = req.user.email;
	
	User.findOne({ where: { email: email } }).then(function( user ) {
		user.update({ avatar: '/avatars/' + req.file.filename }).then(function(){
			res.redirect( '/profile' );
		}); 
	});
});


const storage = multer.diskStorage({
  destination: function( req, file, cb ) {
    cb( null, './uploads' );
  },
  filename: function( req, file, cb ) {
    var originalname = file.originalname;
    var extension = originalname.split( "." );
    filename = Date.now() + '.' + extension[extension.length-1];
    cb(null, filename);
  }
});


const file_upload = multer({ storage:storage }); // object that contains the file destination and name

// enables the user to upload a file
app.post('/uploadFile', requireSignedIn, file_upload.single( 'file' ), function( req, res ){
	const email = req.user.email;
	
	File.create({
            f_name: '/uploads/' + req.file.filename,
            course: req.body.course_code,
            course_num: req.body.course_code + req.body.course_number,
            user_id: req.user.id,
            description: req.body.description
        }).then(function( response ) {
            return res.redirect( '/profile' );
        });
});

// makes sure user is signed in
function requireSignedIn( req, res, next ) {
	
    // if user is not signed in, user is redirected
    if ( !req.session.currentUser ) {
        return res.redirect( '/' );
    }

    next();
}

// notifies state of the server at port 3000
app.listen(3000, function() {
	console.log( 'Server is now running at port 3000' );
});
