import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
// import Rating from "./Rating";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";
import Rating from "./Rating";
function PostComponent({post}){

    const{postedBy}=post;
    const{name,profilePic}=postedBy;
  console.log(post)
  console.log(profilePic)
  
    return(
        // <Card >
        // <Card.Body>
            
        <div className="d-flex flex-column-reverse">
            <img src={profilePic}></img>
            <h1>{post.content}</h1>
        </div>

        // </Card.Body>
    
        // </Card>
        
      
    )

}

export default PostComponent;
