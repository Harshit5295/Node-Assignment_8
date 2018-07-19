var express = require('express');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');

app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());


app.use(session({
	name				: 'myCustomCookie',
	secret				: 'myAppSecret',
	resave				: true,
	httpOnly			: true,
	saveUninitialized	: true,
	cookie 				: {secure: false}
}));


// set the templating engine 
app.set('view engine', 'jade');

//set the views folder
app.set('views',path.join(__dirname + '/app/views'));

var dbPath = "mongodb://localhost/mallDb";

db = mongoose.connect(dbPath);

mongoose.connection.once('open',function() {
	console.log("Database connection open successful ");
});

var fs = require('fs');

// include all our model files
fs.readdirSync('./app/models').forEach(function(file){
	// check if the file is js or not
	if(file.indexOf('.js'))
		// if it is js then include the file from that folder into our express app using require
		require('./app/models/'+file);

});// end for each

// include controllers
fs.readdirSync('./app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		// include a file as a route variable
		var route = require('./app/controllers/'+file);
		//call controller function of each file and pass your app instance to it
		route.controllerFunction(app)

	}

});//end for each

app.use(function (err,req,res,next) {
	res.status(err.status || 500);
	res.render('error',{
		message	: err.message,
		error	: err
	});
});

app.listen(3000, function () {
	console.log('App running on port 3000!');
});