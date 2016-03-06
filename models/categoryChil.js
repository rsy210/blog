var mongodb = require('./db');

function CategoryChil(category_chil,id){
	this.category = category;
	this.post = new DBRef('post', id);
}

module.exports = CategoryChil;

CategoryChil.prorotype.save = function(callback){
	var categoryChil = {
		category_chil:this.category_chil,
		post:this.post
	};

	mongodb.open(function(err ,db){
		if(err){return callback(err);}
		db.collection('categoryChils', function(err, collection){
			if(err){
			mongodb.close();
			return callback(err);
		}
		//将文档插入到posts
		collection.insert(categoryChil, {
			safe:true
		},function(err,doc){
			mongodb.close();
			if(err){return callback(err);}//失败返回err
			callback(null,doc);//返回err为null
		});
		});

	});
}