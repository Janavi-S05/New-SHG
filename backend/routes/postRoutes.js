import express from 'express';

import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import expressAsyncHandler from 'express-async-handler';
const postsRouter=express.Router();


postsRouter.get('/',async(req,res)=>{
    try{
        const posts=await Post.find().populate('postedBy');
        res.json(posts);
    }
    catch(error){
        return res.status(500).json({message:error.message})
    }
})
postsRouter.post('/',expressAsyncHandler(async(req,res)=>{
    console.log(req.body.post);
    // console.log(req.session.user);
    if(!req.body.post)
    {
        console.log("Content param not sent with request");
        return res.sendStatus(400);

    }
    var postData={
        content:req.body.post,
        postedBy:req.body._id
    }
    Post.create(postData)
    .then(async newPost=>{
        newPost =await User.populate(newPost,{path:"postedBy"})
        res.status(201).send(newPost)

    })
    .catch((error)=>{
       
        console.log(error);
        res.sendStatus(400);
    })

   
}))


// async function getPosts(){
//     var results=await Post.find()
//     .populate("postedBy")
//     .populate("retweetData")
//     .populate("replyTo")
//     .sort({"createdAt":-1})
//     .catch((error)=>{
//         console.log(error);
        
//     })
//     await User.populate(results,{path:"replyTo.postedBy"});
//     return await User.populate(results,{path:"retweetData.postedBy"});
    
    
// }




 export default postsRouter;
