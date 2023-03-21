import Button from "react-bootstrap/esm/Button";
 import {  useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
// import {Helmet} from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";
import Axios from 'axios';
import { useState,useContext, useEffect } from "react";
import { Store } from "../Store";

// import {ToastContainer} from 'react-toastify';
// import {toast} from 'react-toastify';
// import { getError } from "../components/util";

export default function SigninScreen(){

   
    const navigate=useNavigate();
    // const {search}=useLocation();
    // console.log(search);
    // const redirectInUrl =new URLSearchParams(search).get('redirect');
    // console.log(redirectInUrl);
    // const redirect=redirectInUrl? redirectInUrl:'/';
    // console.log(redirect);

    const[email,setEmail]=useState('');
    const[password,setPassword]=useState('');
    
    const{state,dispatch:ctxdispatch}=useContext(Store);
    const {userInfo}=state;

    const submitHandler=async(e)=>{
        e.preventDefault();
        try{
           
            const{data}=await Axios.post('/api/users/signin',{
                email,
                password,
            });
            ctxdispatch({type:'USER_SIGNIN',payload:data})
            localStorage.setItem('userInfo',JSON.stringify(data));

             navigate( '/home');
            
        }
        catch(err)
        {   
           alert('Invalid Email or password');
        }


    }

    // useEffect(()=>{
    //     if(userInfo)
    //     {
    //         navigate(redirect);
    //     }
    // },[navigate,redirect,userInfo]);
    return(
        <Container className="small-container">
           
            <h1 className="my-3">Sign In</h1>
            <Form onSubmit={submitHandler}>


                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                    type="email" 
                    required
                    onChange={(e)=>setEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                    type="password"
                    required
                    onChange={(e)=>setPassword(e.target.value)}
                     />
                </Form.Group>
                <div className="mb-3">
                    <Button type="submit">Sign In</Button>
                </div>

                <div className="mb-3"> 
                    New SHG ? {' '}
                    <Link to={`/signup`}>Create your account</Link>
                 </div>
            </Form>
        </Container>
    )
}