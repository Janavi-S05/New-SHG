import mongoose from 'mongoose';

const userSchema=new mongoose.Schema(
    {
        name:{type:String,required:true},
        email:{type:String,required:true,unique:true},
        password:{type:String,required:true},
        profilePic:{
            type:String,
            default:"/images/profilePic.png"
        },
        userbio:[{
            type:String,
        }],
        followers:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
        following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
        isAdmin:{type:Boolean,default:false,required:true},
       
    },
    {
        timestamps:true
    }
);

const User=mongoose.model('User',userSchema);
export default User;
