var mongoose = require('mongoose');
var express = require('express');
var flash = require('req-flash');
var adminRouter = express.Router();
var adminModel = mongoose.model('Admin');
var productModel = mongoose.model('Product');
var responseGenerator = require('./../../libs/responseGenerator');
var auth = require('./../../middlewares/auth');


module.exports.controllerFunction = function (app) {

	adminRouter.get('/',function(req,res){
		res.render('admin');
	});


	adminRouter.get('/create-product',auth.checkLoginAdmin,function(req,res){
		res.render('createProduct');
	});

	adminRouter.get('/all-roducts',function(req,res){
		res.render('allProductsList');
	});

	adminRouter.get('/dashboard',auth.checkLoginAdmin,function(req,res){
	res.render('dashboard',{admin:req.admin});
	});//end get dashboard

	adminRouter.get('/logout',function(req,res){
		req.session.destroy(function(err) {
			res.redirect('/admin');
		})
	}); 


	/*----------------------*/
	/*------Signup API------*/
	/*----------------------*/
	adminRouter.post('/signup',function(req,res){
		if(req.body.name!=undefined && req.body.email!=undefined && req.body.mobile!=undefined && req.body.password!=undefined) {
			adminModel.findOne({'email': req.body.email}, function(err, admin) {
				if (err) {
					req.flash('error','Something Went Wrong');
					res.render('admin');
				}

				else if(admin && admin != null) {
					req.send('error','Email Already Exists');
					res.render('admin');
				}

				else {
					var newAdmin = new adminModel({
						name	: req.body.name,
						email	: req.body.email,
						mobile	: req.body.mobile,
						password:  req.body.password
				});
					newAdmin.save(function(err){
						if(err){

							var myResponse = responseGenerator.generate(true,"some error"+err,500,null);

							res.render('error', {
								message		: myResponse.message,
								error		: myResponse.data
							});
						}

						else{
							req.session.admin = newAdmin;
							delete req.session.admin.password;
							res.redirect('/admin/dashboard');
						}
					});
				}
			});
		}

		else {
			var myResponse = {
				error 	: true,
				message	: "Some Body Parameter is missing",
				status	: 403,
				data	: null
			};

			res.render('error', {
				message		: myResponse.message,
				error		: myResponse.data
			});
		}
	}); //end signup API



	/*---------------------*/
	/*------Login API------*/
	/*---------------------*/
	adminRouter.post('/login', function(req,res){
		adminModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundAdmin){
			if (err) {
				var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
				res.send(myResponse);
				console.log(err);
			}

			else if (foundAdmin==null || foundAdmin==undefined) {
				var myResponse = responseGenerator.generate(true,"Admin not found",404,null);
				res.render('error', {
					message		: myResponse.message,
					error		: myResponse.data
				});
				console.log(err);
			}

			else {
				req.session.admin = foundAdmin;
				delete req.session.admin.password;
				res.redirect('/admin/dashboard');
			}
		});
	}); //end login API


	/*------------------------------*/
	/*------Create Product API------*/
	/*------------------------------*/

	adminRouter.post('/create-product', function (req, res) {
		if (req.body.category!=undefined && req.body.model!=undefined && req.body.price!=undefined && req.body.productColor!=undefined && req.body.seller!==undefined && req.body.description!=undefined) {
			var newProduct = new productModel({
				category			: req.body.category,
				model					: req.body.model,
				price					: req.body.price,
				productColor	: req.body.productColor,
				seller				: req.body.seller,
				description		: req.body.description
			});

			newProduct.save(function (err, createdProduct) {
				if (err) {
					res.json({status: 500, error: err});
				}

				else {
					console.log(createdProduct);
					console.log("Product created Successfully");
					res.redirect('/admin/all-products');
				}
			});
		}
	})


	/*-------------------------------*/
	/*------Product Listing API------*/
	/*-------------------------------*/

	adminRouter.get('/all-products', function(req, res) {
		productModel.find(function(err, foundProduct) {
			if (err) {
				res.render('error','error',{title : "Something Went Wrong"})
			}
			else {
				res.render('allProductsList',{allProductsListing : foundProduct});
			}
		});
	});


	/*------------------------------*/
	/*------Product Detial API------*/
	/*------------------------------*/

	adminRouter.get('/product/:id', function (req, res) {
		productModel.findOne({'_id': req.params.id}, function (err, singleProduct) {
			if (err) {
				res.render('error','error',{title : "Product Not found"})
			}	
			else {
				res.render('productInfo',{getProduct: singleProduct});
			}
		});
	});


	/*----------------------------------------*/
	/*------Edit Product Form Render API------*/
	/*----------------------------------------*/

	adminRouter.get('/edit/:id', function(req, res) {
  	let prodId = req.params.id;
  	productModel.findOne({_id : prodId}).exec((err, product) => {
  		if(err){
  			res.render("error", {title : "Something Went Wrong!!", resCode : 500, msg : "Internal server error", err : err});
  		}

  		else{
  			res.render('editProduct',product);
  		}

  	});
  });

	/*----------------------------*/
	/*------Edit Product API------*/
	/*----------------------------*/

	adminRouter.put('/edit-product/:id', function(req, res) {
		productModel.findOneAndUpdate({'_id': req.params.id}, {new: true}, function(err, result) {
			if (err) {
				res.render("error", {title : "Something Went Wrong!!", resCode : 500, msg : "Internal server error", err : err});
				console.log(err);
			}

			else {
				console.log(result);
				res.redirect('/admin/all-products');
			}
		});
	});

	/*------------------------*/
	/*---Delete Product API---*/
	/*------------------------*/
	
	/*adminRouter.delete('/delete-product/:id', function(req, res) {
		productModel.remove().where({'_id': req.params.id}).exec(function (err, result) {
			if (err) {
				res.render(err,{title : "Something Went Wrong!!", resCode : 500, msg : "Internal server error", err : err});
			}

			else {
				res.redirect('/admin/all-products');
			}
		});
	});*/

	app.use('/admin',adminRouter);
}