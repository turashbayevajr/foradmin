const express =require('express');
const router = express.Router();
const Post = require('../models/post');
const multer = require('multer')
const fs = require("fs");
const { type } = require('os');

//image upload
var storage=multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname+ "_"+ Date.now()+"_"+file.originalname);
    },

});
var upload = multer({
    storage:storage,
}).single("image")
//insert an post into db
router.post('/add', upload, (req, res)=>{
    const post = new Post({
        title: req.body.title,
        message: req.body.message,
        image: req.file.filename,
    });
    post.save((err)=>{
        if(err){
            res.json({message: err.message, type:'danger'});
        }
        else{
            req.session.message ={
                type: 'succes',
                message: 'post added succesfully'
            };
            res.redirect('/news');
        }
    })
});
//get all news route


router.get("/news", (req, res)=>{
    Post.find().exec((err, posts)=>{
if(err){
    res.json({message: err.message});
} else{
    res.render('index',{
        title1: 'News Page',
        posts: posts,
    })
}
    })
});
router.get("/basty", (req, res)=>{
    Post.find().exec((err, posts)=>{
        if(err){
            res.json({message: err.message});
        } else{
            res.render('basty',{
                title1: 'Basty bet',
                posts: posts,
            })
        }
    })
});


router.get("/add", (req, res)=>{
    res.render('add_news', {title1: "Add news"})
});

//edit news
router.get('/edit/:id', (req, res)=>{
    let id = req.params.id;
    Post.findById(id, (err, post)=>{
        if(err){
            res.redirect('/news');
        }
        else{
            if(post==null){
                res.redirect('/news');
            } else{
                res.render('edit_news',{
                    title1: 'Edit News',
                    post: post,
                });
            }
        }
    });
});
//update news
router.post('/update/:id',upload, (req, res)=>{
    let id= req.params.id;
    let new_image='';
    if(req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync('./uploads/'+req.body.old_image);
        } catch(err){
            console.log(err);
        }
    } else{
        new_image=req.body.old_image;
    }
    Post.findByIdAndUpdate(id, {
        message: req.body.message,
        image: new_image,
    }, (err, result)=>{
        if(err){
            res.json({message:err.message, type:'danger'})
        }else{
            req.session.message={
                type: 'success',
                message: 'news updated succedfully'
            };
            res.redirect('/news');
        }
    })
});

//delete news
router.get('/delete/:id', (req, res)=>{
    let id= req.params.id;
    Post.findByIdAndRemove(id, (err, result)=>{
        if(result.image != ''){
            try{
                fs.unlinkSync('./uploads/'+result.image);
            } catch(err){
                console.log(err);
            }
        }
        if(err){
            res.json({message: err.message});
        } else{
            req.session.message ={
                type: 'success',
                message: 'news deleted succedfully'
            };
            res.redirect('/news')
        }
    })
})
module.exports = router;