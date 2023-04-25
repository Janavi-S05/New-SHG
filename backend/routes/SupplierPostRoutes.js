import express from 'express';

import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import expressAsyncHandler from 'express-async-handler';
const SupplierPostsRouter=express.Router();


SupplierPostsRouter.get('/',async(req,res)=>{
    // try{
    //     const posts=await Post.find()
    //     .populate('postedBy')
    //     .populate('retweetData')
    //     .populate('replyTo')
    //     .sort({"createdAt":-1})
    //     .then(async results=>{
    //         results=await User.populate(results,{path:"retweetData.postedBy"});
    //         res.status(200).send(results);
    //     })
       
    // }
    // catch(error){
    //     return res.status(500).json({message:error.message})
    // }

    var results=await getPosts({});
    res.status(200).send(results);
})
SupplierPostsRouter.post('/',expressAsyncHandler(async(req,res)=>{
    // console.log(req.body.post);
   
    if(req.body.end){
        console.log(req.body.end);
        console.log(req.body._id);
        return res.sendStatus(400);
    }
    if(!req.body.post)
    {
        console.log("Content param not sent with request");
        return res.sendStatus(400);

    }
    var postData={
        content:req.body.post,
        postedBy:req.body._id
    }
    
    if(req.body._id)
    {
        postData.replyTo=req.body._id;

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

// postsRouter.put('/',expressAsyncHandler(async(req,res)=>{
//     res.status(200).send("hihaaa");
// }))


SupplierPostsRouter.put("/:id/like",async(req,res,next)=>{
    // console.log(req.params.id);

    var postId=req.params.id;
    var userId=req.body.postedbyid;
    var postedBy=req.body.postedBy;
    const{likes}=postedBy;
    console.log("userid",userId);
    console.log("postid",postId);
    console.log(postedBy);

    var isLiked=likes && likes.includes(postId);
    console.log("isLike:"+isLiked)
    var option=isLiked ? "$pull" : "$addToSet";
  
    postedBy=await User.findByIdAndUpdate(userId,{[option]: {likes:postId}},{new:true})
     .catch(error=>{
         console.log(error);
         res.sendStatus(400);
     })
    
    //  res.sendStatus(200);
    // //Insert post like
    var post=await Post.findByIdAndUpdate(postId,{[option]: {likes:userId}},{new:true})
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    })
    res.status(200).send(post);
})


SupplierPostsRouter.post("/:id/retweet",async(req,res,next)=>{
    // console.log(req.params.id);

    
    var postId=req.params.id;
    var userId=req.body.postedbyid;
     var postedBy=req.body.postedBy;
    
    

    var deletedPost= await Post.findOneAndDelete({postedBy:userId,retweetData:postId})
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    })
    var option=deletedPost !=null? "$pull" : "$addToSet";
    var repost=deletedPost;

    if(repost==null)
    {
        repost=await Post.create({postedBy:userId,retweetData:postId})
        .catch(error=>{
            console.log(error);
            res.sendStatus(400);
        })
    }
    
    postedBy=await User.findByIdAndUpdate(userId,{[option]: {retweets:repost._id}},{new:true})
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    })

    var post=await Post.findByIdAndUpdate(postId,{[option]: {retweetUsers:userId}},{new:true})
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    })
    res.status(200).send(post);

    // var isLiked=likes && likes.includes(postId);
    // console.log("isLike:"+isLiked)
    // var option=isLiked ? "$pull" : "$addToSet";
    
    
    
    //  res.sendStatus(200);
    // //Insert post like
    // var post=await Post.findByIdAndUpdate(postId,{[option]: {likes:userId}},{new:true})
    // .catch(error=>{
    //     console.log(error);
    //     res.sendStatus(400);
    // })
    // res.status(200).send(post);
})






async function getPosts(filter){
    var results=await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({"createdAt":-1})
    .catch((error)=>{
        console.log(error);
        
    })
    await User.populate(results,{path:"replyTo.postedBy"});
    return await User.populate(results,{path:"retweetData.postedBy"});
    
    
}




 export default SupplierPostsRouter;
