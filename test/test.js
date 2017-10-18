const File = require('./models').File;
var expect  = require('chai').expect;
var request = require('request');

function getCourse( course_code ) {
    File.findAll({ where: { course: course_code } }).then(function( results ) {
        return results;
    });
}

describe('Landing Page Test', function() {
	it('Should have a status code of 200', function(){
        request('http://localhost:3000/', function( error, res, body ) {
            expect( res.statusCode ).to.equal( 200 );
        });
    });
});


describe('Profile Page Test', function() {
    it('Should return a user object', function(){
        request('http://localhost:3000/profile', function( error, res, body ) {
            expect( body.user ).to.be.an( 'object' );
        });        
    });

    it('Should return files', function(){
        request('http://localhost:3000/profile', function( error, res, body ) {
            expect( body.files ).to.be.an( 'array' );
        });        
    });

});


describe ('File Directory Test', function() {
    it('Should return files', function(){
        request('http://localhost:3000/course', function( error, res, body ) {
            expect( body.files ).to.be.an( 'array' );
        });        
    });

    it('Should return appropriate files', function(){
        request('http://localhost:3000/course?course_code=1', function( error, res, body ) {
            expect( body.files ).to.be.an( 'array' );

            var query = getCourse( 1 );

            for (var i = 0; i < course_code.length; i++) {
                expect( body.files[i].course_num ).to.equal( query.course_num );
                expect( body.files[i].f_name ).to.equal( query.f_name );
                expect( body.files[i].course ).to.equal( query.course );
                expect( body.files[i].user_id ).to.equal( query.user_id );
                expect( body.files[i].description ).to.equal( query.description );
            }
        });        
    });
});

    
