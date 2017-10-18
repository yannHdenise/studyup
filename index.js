const express = require( 'express' );
const database = require( './database' );
const File = require( './models' ).File;
const User = require( './models' ).User;
const Comment = require( './models' ).Comment;
const flash = require( 'express-flash' );
var bodyparser = require( 'body-parser' );
const consolidate = require( 'consolidate' );
const cookieparser = require( 'cookie-parser' );
const session = require( 'express-session' );
const middlewares = require( 'middlewares' );
const multer = require( 'multer' );
const path = require( 'path' );
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


app.post('/postcomment', requireSignedIn, function( req, res ) {
    Comment.create({
        name: req.body.name,
        content: req.body.content,
        file_id: req.body.file_id
    }).then(function( response ) {
        return res.redirect( '/comments' + '?id=' + req.body.file_id );
    });
});


app.post('/delete', requireSignedIn, function( req, res ) {
	File.destroy({
	    where: {
	       id:req.body.id
	    }
	}).then(function( results ) {
		res.redirect( '/profile' );
	});
});


app.get('/', function( req, res ) {
	res.render( 'index.html' );
});


app.get('/course', requireSignedIn, function( req, res ) {
	const ALL = "ALL";
	
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


const avatarpic = multer({ dest: './avatar_pics' })


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


const file_upload = multer({ storage:storage });


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


function requireSignedIn( req, res, next ) {
    if ( !req.session.currentUser ) {
        return res.redirect( '/' );
    }
    next();
}


app.listen(3000, function() {
	console.log( 'Server is now running at port 3000' );
});
