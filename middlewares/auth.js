var mongoose = require('mongoose');
var adminModel = mongoose.model('Admin');

exports.setLoggedInAdmin = function (req, res, next) {
	if (req.session && req.session.admin) {
		adminModel.findOne({'email':req.session.admin.email},function(err,admin){

			if(admin){
				req.admin = admin;
				delete req.admin.password;
				req.session.admin = admin;
				next()
			}
			else{
				//do nothing, because admin is logged in
			}
		});
	}
	else{
		next();
	}
}


exports.checkLoginAdmin = function (req,res,next) {
	if(!req.admin && !req.session.admin){
		res.redirect('/admin');
	}
	else{
		next();
	}
}//end check admin login