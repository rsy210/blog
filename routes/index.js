var express = require('express');
var router = express.Router();
var Post = require('../models/post.js');
var markdown = require('markdown').markdown;
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg')
  }
});

var updFile = multer({ storage: storage });
/*var updFile = multer({
          dest: './public/uploads',
          rename: function(fieldname, filename){
            return filename+".jpg";
          }});
  rename: function(fieldname, filename){
    return filename; 
  }*/


/* GET home page. */
var pvNs = [];
router.get('/', function(req, res, next) {
var pvNs2 = [];
  Post.getAll(function(err, docs, total){
    if(err){
      console.log(err);
     // return res.redirect('/');
    }
   /* pvNs2 = sortByPv(docs);
    pvNs = sortByPv(docs);*/
   /* pvNs2 = pvNs2.slice(0,10);
    console.log(pvNs2);*/
    pvNs = docs;
    var len = pvNs.length;
    if(len >= 10){
    var pvNs_ten = pvNs.splice(0,10);
  }else{
    var pvNs_ten = pvNs.splice(0,len);
  }
     res.render('index',{
      pvNs:pvNs_ten,
      total:total
  });
  });
});
router.post('/', function(req, res){
  Post.getAll(function(err, docs, total){
    if(err){
      console.log(err);
     // return res.redirect('/');
    }
    var pvNs_ten = pvNs.splice(0,10);
    console.log("pvNs_ten");
    console.log(pvNs_ten);
     res.json({"data":pvNs_ten});
  });
});
function sortByPv(docs){
    var pvNs = [];
      docs.forEach(function(doc){
      var pv = doc.pv;
      if(pv != undefined){
        var len = pvNs.length;
        if(len != 0){
          for (var i = 0; i < len; i++) {
            if(pv >= pvNs[i].pv){
              pvNs.splice(i, 0, doc);
              break;
            }else{
              if(pv < pvNs[len-1].pv){
                pvNs.push(doc);
                break;
              }
            }
          }
        }else{
          pvNs.push(doc);
        }
    }
    });
      return pvNs;
}

router.get('/raosy/myselfblog/post', function(req, res, next) {
  res.render('post');
}); 
router.post('/post', function(req, res) {
   ///保存文本
  //var currentUser = req.session;
  function randString(len){
    var string_R = '';
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  for (var i =0; i < len; i++) {
      string_R += chars.charAt(Math.floor(Math.random()*(chars.length)));
  }
  return string_R;
  }
  var id = randString(8);
  console.log(req.body.category);
  var post = new Post(id,req.body.title, req.body.category, req.body.category_chil,req.body.post);
  post.save(function(err,doc){
    if(err){
      console.log(err);
      return res.redirect('/');
    }
    //req.flash('success','发布成功');
    res.redirect('/articles/'+req.body.category+'/'+req.body.category_chil+'/'+doc.ops[0].id);//发布成功跳转到详情页
  });
});

/*router.post('/upload', function(req, res, next) {
  var upload = updFile.single('updImg');
  upload(req, res, function(err){
    if(err){
      console.log(err);
    }
  });
  console.log("test");
  console.log(req.file);
  res.json({"data":req.file});
});*/
//上传图片
router.post('/upload', updFile.single('updImg'), function(req, res){
  console.log(req.file);
  res.json({"data":req.file.path});
});


//获取格式为分类的链接并返回相应文章
router.get('/articles/:category', function(req, res){
  var time = req.query.tm ? req.query.tm : '';
  var page = req.query.pg ? parseInt(req.query.pg) : 1;
  Post.getTenByCategory(req.params.category, time, page, function(err, posts, total){
    if(err){
      console.log(err);
     // return res.redirect('/');
    }
    if((posts.doc).length > 0){
      var tmfir = ((posts.doc)[0]).time.time;
      var tmlas = ((posts.doc)[(posts.doc).length - 1]).time.time;
    }
      res.render('detail',{
      post:posts,
      category: req.params.category,
      timefir: tmfir,
      timelas: tmlas,
      page: page,
      pageCount: total%10 === 0 ? parseInt(total/10) : parseInt(total/10) +1, 
      isFirst: (page - 1) == 0,
      isLast: ((page-1)*10 + (posts.doc).length) == total
    });
  });
});

//获取格式为分类、子分类的链接并返回相应文章
router.get('/articles/:category/:categorychil', function(req, res){
  var time = req.query.tm ? req.query.tm : '';
  var page = req.query.pg ? parseInt(req.query.pg) : 1;
  Post.getTenByCategoryChil(req.params.category, req.params.categorychil, time, page, function(err, posts, total){
    if(err){
      console.log(err);
     // return res.redirect('/');
    }
    if((posts.doc).length > 0){
      var tmfir = ((posts.doc)[0]).time.time;
      var tmlas = ((posts.doc)[(posts.doc).length - 1]).time.time;
    }
    console.log(posts);
      res.render('detail',{
      post:posts,
      category: req.params.category,
      timefir: tmfir,
      timelas: tmlas,
      page: page,
      pageCount: total%10 === 0 ? parseInt(total/10) : parseInt(total/10) +1, 
      isFirst: (page - 1) == 0,
      isLast: ((page-1)*10 + (posts.doc).length) == total
    });
    });
  });

///获取格式为分类、子分类、id的链接并返回相应文章
router.get('/articles/:category/:categorychil/:titleId', function(req, res){
  Post.getOneByCategoryChil(req.params.category, req.params.categorychil, req.params.titleId, function(err, post, postP, postN){
    if(err){
      console.log(err);
      return res.redirect('/');
    }
    console.log(post);
    res.render('detail',{
      title:req.params.title,
      post:post,
      postP:postP,
      postN:postN,
      category: req.params.category
    });
  });
})




module.exports = router;
