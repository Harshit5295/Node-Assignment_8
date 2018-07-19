var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var productSchema = new Schema({

	category				: {type:String, required:true},
	model					: {type:String, required:true},
	price					: {type:String, required:true},
	productColor			: {type:String, required:true},
	seller					: {type:String, required:true},
	description				: {type:String, required:true}

});


mongoose.model('Product', productSchema);