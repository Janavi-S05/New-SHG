import React from "react";
// import "./Modal.css";
import { useState } from "react";
import axios from "axios";
function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000<30) return "Just now"
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return  Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return  Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}


function Modal(props) {

    const{closeModal,post}=props;
    const{postedBy}=post
    // console.log(_id);
    const{createdAt}=postedBy;
    const{_id}=postedBy;
    console.log({props})
    const[end,setEnd]=useState('');
    var timestamp=timeDifference(new Date(),new Date(createdAt));
    function handleChange(event) {
        // console.log(event.target.value);
        setEnd(event.target.value);

      }
      console.log(end);

      const submitReply=async (value)=>{
        // value.preventDefault();
        console.log("Reply button is clicked")
        console.log(value);
        const result=await axios.post(`/api/posts`,{
            _id,
            end,
            post,
            postedBy,
    
        });
        closeModal(false);
        const{data}=result
        console.log(result);
        // console.log(data.likes.length);
        
    
        // if(result.status===200)
        // {
        //     window.location.reload();
        // }
    
      }
    
  return (

    <div className="modalBackground">
      <div className="modalContainer">
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              closeModal(false);
            }}
          >
            X
          </button>
        </div>
        {/* <div className="title">
          <h1>Are You Sure You Want to Continue?</h1>
        </div> */}
        <div className="body">
          {/* <p>The next page looks amazing. Hope you want to go there!</p> */}
          
          {timestamp}
          {postedBy.name}
            {post.content}
            <span>@{postedBy.name}</span>
        </div>
        <input placeholder="END"
            onChange={handleChange}
        ></input>
        <div className="footer">
          <button
            onClick={() => {
              closeModal(false);
            }}
            id="cancelBtn"
          >
            Cancel
          </button>
          <button onClick={()=>submitReply(end)}>Reply</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
