import Button from "react-bootstrap/esm/Button";
import { useLocation, useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import {Helmet} from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";
 import Axios from 'axios';
import { useState, useContext } from "react";
 import { Store } from "../Store";

// import {ToastContainer} from 'react-toastify';
import {toast} from 'react-toastify';
// import { getError } from "../components/util";

export default function SignupScreen(){

   
    const navigate=useNavigate();
    const {search}=useLocation();
    const redirectInUrl =new URLSearchParams(search).get('redirect');
    const redirect=redirectInUrl? redirectInUrl:'/';

    const[name,setName]=useState('');
    const[email,setEmail]=useState('');
    const[password,setPassword]=useState('');
    const[confirmPassword,setConfirmPassword]=useState('');
    const[address,setAddress]=useState('');
    const[phoneNumber,setphoneNumber]=useState('');
    const[certificate,setCertificate]=useState('');

    
    const{state,dispatch:ctxdispatch}=useContext(Store);
    const {userInfo}=state;

    const submitHandler=async(e)=>{
        e.preventDefault();
        if(password!==confirmPassword)
        {
            toast.error('Password do not match');
            return;
        }
        try{
            const{data}=await Axios.post('/api/users/signup',{
                name,
                email,
                password,
                

            });
            ctxdispatch({type:'USER_SIGNIN',payload:data})
            localStorage.setItem('userInfo',JSON.stringify(data));

            navigate(redirect || '/')
            
        }
        catch(err)
        {   
           console.log(err);
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
           
            <h1 className="my-3">SHG Sign Up</h1>
            <Form onSubmit={submitHandler}>


            <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Leader Name</Form.Label>
                    <Form.Control 
                
                    required
                    onChange={(e)=>setName(e.target.value)}
                    />
                </Form.Group>


                <Form.Group className="mb-3" controlId="email">
                    <Form.Label> Email</Form.Label>
                    <Form.Control 
                    type="email" 
                    required
                    onChange={(e)=>setEmail(e.target.value)}
                    />
                </Form.Group>
            
                {/* <Form.Group className="mb-3" controlId="phonenumber">
                    <Form.Label> Phone Number</Form.Label>
                    <Form.Control 
                 
                    required
                    onChange={(e)=>setphoneNumber(e.target.value)}
                    />
                </Form.Group> */}

                {/* <Form.Group className="mb-3" controlId="address">
                    <Form.Label> Address</Form.Label>
                    <Form.Control 
                 
                    required
                    onChange={(e)=>setAddress(e.target.value)}
                    />
                </Form.Group> */}

                {/* <Form.Group>
                  <Form.Label>Item Image</Form.Label>
                  <Form.Control type="file"
                    onChange={(e)=>setCertificate(e.target.value)}
                  />
                  </Form.Group> */}

                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                    type="password"
                    required
                    onChange={(e)=>setPassword(e.target.value)}
                     />


                    <Form.Group className="mb-3" controlId="confirmpassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control 
                    type="password" 
                    required
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    />
                </Form.Group>


                </Form.Group>
                <div className="mb-3">
                    <Button type="submit">Sign Up</Button>
                </div>

                <div className="mb-3">
                    Already have an account ? {' '}
                    <Link to={`/signin?redirect=${redirect}`}>Sign In</Link>
                </div>
            </Form>
        </Container>
    )
}