var mongodb = require('./db');

function Category(category,id){
	this.category = category;
	this.post = new DBRef('post', id);
	this.children = new Array();
}

module.exports = Category;

Category.prorotype.save = function(callback){
	var category = {
		category:this.category,
		post:this.post,
		children:this.children
	};

	mongodb.open(function(err ,db){
		if(err){return callback(err);}
		db.collection('categorys', function(err, collection){
			if(err){
			mongodb.close();
			return callback(err);
		}
		//将文档插入到posts
		collection.insert(category,{
			safe:true
		},function(err,doc){
			mongodb.close();
			if(err){return callback(err);}//失败返回err
			callback(null,doc);//返回err为null
		});
		});

	});
}