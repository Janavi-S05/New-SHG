import axios, { Axios } from "axios";
import React, { useState } from "react";
 import Button from 'react-bootstrap/Button';
 import { useContext } from "react";
 import { Store } from "../Store";
// import Card from 'react-bootstrap/Card';
// import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Container from 'react-bootstrap/Container';
// import { Body } from "./AuctionScreen";
import { Form, Link } from "react-router-dom";
import { useEffect } from "react";
import { useReducer } from "react";
import logger from 'use-reducer-logger';
import SupplierPostComponent from "../components/SupplierPostComponent";


const reducer=(state,action)=>{
    switch(action.type)
    {
        case 'FETCH_REQUEST':
            return{...state,loading:true};
        case 'FETCH_SUCCESS':
            return{...state,posts:action.payload,loading:false};
        case 'FETCH_FAIL':
            return{...state,loading:false,error:action.payload};
        default:
            return state;
    }
}






export default function SupplierPost()
{
    const[post,setPost]=useState("");
    console.log(post);
    const{state,dispatch:ctxDispatch}=useContext(Store);
    const{userInfo}=state;
    console.log(userInfo);
    const{_id}=userInfo;
    console.log(_id);

    const submitPost=async(e)=>{
        e.preventDefault();
        console.log("i am gettting called")
        try{
            const{data}=await axios.post('api/posts',
            {
                post,
                _id,
            })
            console.log(data);
        }
        catch(err)
        {
            console.log("hey");
            console.log(err)
        }
     
       
    }

    const[{loading,error,posts}, dispatch]=useReducer(logger(reducer),{
        posts:[],
         loading:true,
         error:'',
     })

    
    useEffect(()=>{
        const fetchData=async()=>
        {
            
            
             dispatch({type:'FETCH_REQUEST'});
            
            try{
                const result=await axios.get('/api/posts');
                console.log(result);
                dispatch({type:'FETCH_SUCCESS',payload:result.data});
            }

            catch(err)
            {
                console.log(err);
                 dispatch({type:'FETCH_FAIL',payload:err.message});
            }
                     
        };
        fetchData();
    },[]);

    console.log(posts);
    
    return( 
        <div>
            <body class="bg-gray-100 h-fit">
                <div class=" w-full flex flex-row flex-wrap pt-5 px-16">
                    <div class="w-full  flex flex-row flex-wrap justify-center">
                        <div class="w-0 md:w-1/4 lg:w-1/5 h-0 md:h-screen overflow-y-hidden bg-white-shadow-lg">
                            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <h2 class="text-lg font-bold mb-4">Profile</h2>
                                <img src="https://via.placeholder.com/150" alt="Profile picture" class="w-full mb-4"></img>
                                <h3 class="text-gray-700 font-bold mb-2">John Doe</h3>
                                <p class="text-gray-600 mb-4">@johndoe</p>
                                <ul>
                                    <li class="mb-2">
                                        <span class="text-gray-600 mr-2">Followers:</span>
                                        <span class="font-bold">1000</span>
                                    </li>
                                    <li class="mb-2">
                                        <span class="text-gray-600 mr-2">Following:</span>
                                        <span class="font-bold">500</span>
                                    </li>
                                    <li class="mb-2">
                                        <span class="text-gray-600 mr-2">Posts:</span>
                                        <span class="font-bold">200</span>
                                    </li>

                                </ul>
                            </div>
                        </div>
                        <div class="w-full md:w-3/4 lg:w-3/5 md:px-16 lg:24 h-full ">
                            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <h2 class="text-lg font-bold mb-4">What's on your mind?</h2>
                                <form onSubmit={submitPost}>
                                    <div class="mb-4">
                                        <textarea onChange={(e) => setPost(e.target.value)} class="w-full rounded-lg border border-gray-400 py-2 px-4" rows="4" placeholder="Write something..."></textarea>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center pr-5">
                                            
                                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Post</button>
                                        </div>
                                        <div class="flex items-center">
                                    
                                        </div>
                                    </div>
                                </form>

                            </div>
                            <div class="mt-2">
                                {posts.map((post) => (

                                    <Col  className="mb-3">
                                        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                            <h2 class="text-lg font-bold mb-4">Recent Posts</h2>
                                            <div class="border-b border-gray-200 mb-4">
                                                
                                            </div>
                                            <SupplierPostComponent key={post._id} post={post}></SupplierPostComponent>
                                        </div>
                                    </Col>

                                ))}
                            </div>
            
                        </div>
                    </div>
                </div>
                
            </body>
            </div>
  
    )
}
