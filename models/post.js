var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(id,title,category,category_chil,post){
	this.id = id;
 	this.title = title;
 	this.category = category;
 	this.category_chil = category_chil;
 	this.post = post;	
}

module.exports = Post;

//存储一篇文章及相关信息
Post.prototype.save = function(callback){
 	var date = new Date();
 	//存储时间格式
 	var time = {
 		date :date,
 		year :date.getFullYear(),
 		month :date.getFullYear()+"-"+(date.getMonth()+1),
 		day :date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
 		minute :date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+(date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes()),
 		time :''+date.getFullYear()+(date.getMonth()+1)+date.getDate()+date.getHours()+(date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes())
 	}

//要存入数据库的文档
var post ={
	id:this.id,
	time:time,
	title:this.title,
	category:this.category,
	category_chil:this.category_chil,
	post:this.post,
	pv: 0
};

//打开数据库
mongodb.open(function(err,db){
	if(err){return callback(err);}

	//读取post集合
	db.collection('posts',function(err,collection){
		if(err){
			mongodb.close();
			return callback(err);
		}
		//将文档插入到posts
		collection.insert(post,{
			safe:true
		},function(err,doc){
			mongodb.close();
			if(err){return callback(err);}//失败返回err
			callback(null,doc);//返回err为null
		});
	});
});
}



//读取全部文章及相关信息
Post.getAll = function(callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){return callback(err);}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query={};
			//使用count返回查询的文章数
			collection.count(query, function(err, total){
			//根据query对象查询文章
			collection.find(query).sort({
				pv:-1
			}).toArray(function(err,docs){
				mongodb.close();
				if(err){return callback(err);}//失败返回err
				docs.forEach(function(doc){
					if(doc.post != undefined){
					doc.post = markdown.toHTML(doc.post);}
					if(doc.pv ==undefined){
						doc.pv=0;
					}
				});
				callback(null,docs, total);//成功，以数组形式返回查询结果
				});
			});
		});
	});
}
//读取某类全部文章及相关信息
Post.getTenByCategory = function(category, time, page, callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){console.log("err1:"+err);return callback(err);}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query={"category": category};
			var lim;
			if(time != ''){
				lim = {limit:10};
				if (time.indexOf('$lt') != -1 && time.indexOf('$gt') === -1) {
					time = time.substr(time.indexOf(':')+1);
					console.log(time.indexOf('$lt'));
					query={"category": category,
						"time.time": {$lt:time}};
				}else if (time.indexOf('$gt') != -1 && time.indexOf('$lt') === -1) {
					time = time.substr(time.indexOf(':')+1);
					query={"category": category,
						"time.time": {$gt:time}};
				}
			}else{
				lim = {skip:(page-1)*10,
					limit:10}
			}

			//获取父分类category下的所有不重复的子分类
			getCategoryChil(collection, category);
			//使用count返回查询的文章数
			collection.count({"category": category}, function(err, total){
				//查询category的文档，返回time，title组成的数组
			collection.find(query, lim).sort({
				time:-1
			}).toArray(function(err,docs){
				mongodb.close();
				if(err){console.log("err4:"+err);return callback(err);}//失败返回err
				docs.forEach(function(doc){
					doc.post = markdown.toHTML(doc.post);
				});
				callback(null, {"doc":docs,"categorychil":categoryChils}, total);//将查询到的文章与子分类以json对象格式返回
			});
			});
		});
	});
}
//读取某类全部文章及相关信息
Post.getTenByCategoryChil = function(category,category_chil,  time, page, callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){return callback(err);}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query={"category": category,
				"category_chil": category_chil};
			var lim;
			if(time != ''){
				lim = {limit:10};
				if (time.indexOf('$lt') != -1 && time.indexOf('$gt') === -1) {
					time = time.substr(time.indexOf(':')+1);
					console.log(time.indexOf('$lt'));
					query={"category": category,
							"category_chil": category_chil,
							"time.time": {$lt:time}};
				}else if (time.indexOf('$gt') != -1 && time.indexOf('$lt') === -1) {
					time = time.substr(time.indexOf(':')+1);
					query={"category": category,
							"category_chil": category_chil,
							"time.time": {$gt:time}};
				}
			}else{
				lim = {skip:(page-1)*10,
					limit:10}
			}

			//获取父分类category下的所有不重复的子分类
			getCategoryChil(collection, category);
			//使用count返回查询的文章数
			collection.count({"category": category,
				"category_chil": category_chil}, function(err, total){
			//查询category的文档，返回time，title组成的数组
			collection.find(query, lim).sort({
				time:-1
			}).toArray(function(err,docs){
				mongodb.close();
				if(err){return callback(err);}//失败返回err
				docs.forEach(function(doc){
					doc.post = markdown.toHTML(doc.post);
				});
				callback(null, {"doc":docs,"categorychil":categoryChils}, total);//将查询到的文章与子分类以json对象格式返回查	

			});
		});
		});
	});
}



//获取一篇文章
Post.getOne = function( title, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//根据时间，文章名进行查询
			collection.findOne({
				//"time.day" : day,
				"title" : title
			}, function(err,doc){
				mongodb.close();
				if(err){return callback(err);}
				doc.post = markdown.toHTML(doc.post);
				callback(null, doc);//返回查询到的文章
			});
		});
	});
}

//获取某类一篇文章
Post.getOneByCategoryId = function(category, titleId, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//根据时间，文章名进行查询
			collection.findOne({
				//"time.day" : day,
				"category": category,
				//"_id" : titleId
				id:titleId
			}, function(err,doc){
				
				if(err){return callback(err);}
				doc.post = markdown.toHTML(doc.post);
				mongodb.close();
				callback(null, doc);//返回查询到的文章
			});
		});
	});
}



//获取某类一篇文章
Post.getOneByCategoryChil = function(category, category_chil, titleId, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {
				//"time.day" : day,
				"category": category,
				"category_chil": category_chil,
				//"_id" : titleId
				id:titleId
			};
			//获取父分类category下的所有不重复的子分类
			getCategoryChil(collection, category);
			//根据时间，文章名进行查询

			collection.findOne(query, function(err,doc){
				collection.findOne({"category": category,
					"category_chil": category_chil,
					"time.time":{$gt:(doc.time.time)}},{limit:1}, function(err, docP){
				collection.findOne({"category": category,
					"category_chil": category_chil,
					"time.time":{$lt:(doc.time.time)}},{limit:1}, function(err, docN){
						doc.post = markdown.toHTML(doc.post);	
						if (docP != undefined) {docP.post = markdown.toHTML(docP.post);};
						if (docN != undefined) {docN.post = markdown.toHTML(docN.post);};
					
				if(err){mongodb.close();
					return callback(err);}
					if (doc) {
						collection.update(query, {
							$inc:{"pv":1}},function(err){
								mongodb.close();
								if(err){return callback(err);}
							});

						}
				callback(null, {"doc":doc,"categorychil":categoryChils}, {"doc":docP,"categorychil":categoryChils}, {"doc":docN,"categorychil":categoryChils});//将查询到的文章与子分类以json对象格式返回查	
					});
				});		
			});

			});
		/*	collection.distinct("category_chil", function(err,doc){

			doc2=doc;
			mongodb.close();
			doc3={"doc":doc1,"category_chil":doc2}
				if(err){return callback(err);}
				callback(null, doc3);//返回查询到的文章	
			});*/
});

			

	
}



//获取某类一篇文章
Post.getOneById = function(titleId, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//根据时间，文章名进行查询
			collection.findOne({
				id:titleId
			}, function(err,doc){
				mongodb.close();
				callback(null, doc);//返回查询到的文章
			});
		});
	});
}


//获取子分类信息
var categoryChils;
function getCategoryChil(collection, category){
	//查询category的文档，返回time，title组成的数组
	collection.distinct("category_chil", {"category":category}, function(err,docs){
		console.log(docs);
		if(err){return callback(err);}//失败返回err
			categoryChils = docs;//返回子分类数组
		});
}