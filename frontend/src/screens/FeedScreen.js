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
import PostComponent from "../components/PostComponent";


const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, posts: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}



export default function FeedScreen() {
    const [post, setPost] = useState("");
    console.log(post);
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;
    console.log(userInfo);
    const { _id } = userInfo;
    console.log(_id);
    const submitPost = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('api/posts',
                {
                    post: post,
                    _id,
                })
            console.log(data);
        }
        catch (err) {
            console.log("hey");
            console.log(err)
        }

    }

    const [{ loading, error, posts }, dispatch] = useReducer(logger(reducer), {
        posts: [],
        loading: true,
        error: '',
    })


    useEffect(() => {
        const fetchData = async () => {

            dispatch({ type: 'FETCH_REQUEST' });

            try {
                const result = await axios.get('/api/posts');
                console.log(result);
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
            }

            catch (err) {
                console.log(err);
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }



        };
        fetchData();
    }, []);

    console.log(posts);
    const reversedposts = [...posts].reverse();
    return (
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
                                            {/* <label for="image-upload" class="cursor-pointer mr-3">
                                            </label>
                                            <input id="image-upload" type="file" class="hidden"></input> */}
                                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Post</button>
                                        </div>
                                        <div class="flex items-center">
                                            {/* <span class="text-gray-600 mr-3">Add to your post:</span>
                                            <button class="bg-gray-200 hover:bg-gray-300 rounded-full p-2" type="button">
                                                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                </svg>
                                            </button> */}
                                            {/* <button class="bg-gray-200 hover:bg-gray-300 rounded-full p-2 mx-1" type="button">
                                                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 
                      24" xmlns="http://www.w3.org/2000/svg">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                                </svg>
                                            </button>
                                            <button class="bg-gray-200 hover:bg-gray-300 rounded-full p-2" type="button">
                                                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                </svg>
                                            </button> */}
                                        </div>
                                    </div>
                                </form>

                            </div>
                            {/* <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <h2 class="text-lg font-bold mb-4">Recent Posts</h2>
                                <div class="border-b border-gray-200 mb-4">
                                    <div class="flex items-center">
                                        <img class="w-10 h-10 rounded-full mr-4" src="https://via.placeholder.com/150" alt="Avatar"></img>
                                        <div>
                                            <span class="font-bold text-gray-700">John Doe</span>
                                            <span class="text-gray-600 text-sm"> on April 15th, 2023</span>
                                        </div>
                                    </div> */}
                            <div class="mt-2">
                                {reversedposts.map((post) => (

                                    <Col  className="mb-3">
                                        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                            <h2 class="text-lg font-bold mb-4">Recent Posts</h2>
                                            <div class="border-b border-gray-200 mb-4">
                                                <div class="flex items-center">
                                                    <img class="w-10 h-10 rounded-full mr-4" src="https://via.placeholder.com/150" alt="Avatar"></img>
                                                    <div>
                                                        <span class="font-bold text-gray-700">John Doe</span>
                                                        <span class="text-gray-600 text-sm"> on April 15th, 2023</span>
                                                    </div>
                                                </div>
                                                {/* <div class="flex items-center">
                                                    <img class="w-10 h-10 rounded-full mr-4" src="https://via.placeholder.com/150" alt="Avatar"></img>
                                                    <div>
                                                        <span class="font-bold text-gray-700">John Doe</span>
                                                        <span class="text-gray-600 text-sm"> on April 15th, 2023</span>
                                                    </div>
                                                </div> */}
                                            </div>
                                            <PostComponent key={post._id} post={post}></PostComponent>
                                        </div>
                                        {/* <PostComponent key={post._id} post={post}></PostComponent> */}
                                    </Col>

                                ))}
                            </div>
                            {/* <div class="flex justify-between items-center mt-4">
                                <div class="flex items-center">
                                </div>
                            </div> */}
                            {/* </div> */}

                            {/* </div> */}
                        </div>
                    </div>
                </div>
                
            </body>
        </div>
    )
}
