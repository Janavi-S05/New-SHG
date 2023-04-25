import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
// import Rating from "./Rating";
import { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";
import Rating from "./Rating";
// import { AiOutlineHeart } from "react-icons/ai";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faRetweet, faComment } from '@fortawesome/free-solid-svg-icons';
import Modal from "./Modal";
function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return "Just now"
        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}
function SupplierPostComponent({ post }) {

    const [likeCount, setLikeCount] = useState(0);
    const [openModal, setopenModal] = useState(false);
    console.log(post)
    const { _id } = post;
    const { postedBy } = post;

    const { name, profilePic, createdAt } = postedBy;
    console.log(createdAt);
    const postedbyid = postedBy._id;
    console.log("postedbyid", postedbyid);
    console.log(post)
    console.log(profilePic)
    var timestamp = timeDifference(new Date(), new Date(createdAt));
    const [likes, setlike] = useState(0);






    if (post == null) return alert("post object is null");

    var isRetweet = post.retweetData !== undefined;
    console.log(isRetweet)
    var retweetedBy = isRetweet ? post.postedBy.name : null;
    post = isRetweet ? post.retweetData : post;

    // console.log(postedBy._id);

    if (postedBy._id === undefined) {
        return console.log("user object not populated");
    }
    var displayName = postedBy.name;
    console.log(retweetedBy)


    var replyFlag = "";
    if (post.replyTo && post.replyTo._id) {
        if (!post.replyTo._id) {
            return alert("Reply to is not populated");
        }
        else if (!post.replyTo.postedBy._id) {
            return alert("Posted by is not populated");
        }

        var replyToUsername = post.replyTo.postedBy.name;
        replyFlag = { replyToUsername }

    }
    console.log(replyFlag);




    const submitLike = async (value) => {
        // value.preventDefault();
        console.log("Like button is clicked")
        console.log(value);
        const result = await axios.put(`/api/posts/${_id}/like`, {
            postedbyid,
            post,
            postedBy,

        });
        const { data } = result
        console.log(data.likes.length);
        setLikeCount(data.likes.length);

        // if(result.status===200)
        // {
        //     window.location.reload();
        // }

    }




    const submitRetweet = async (value) => {
        // value.preventDefault();
        console.log("Retweet button is clicked")
        console.log(value);
        const result = await axios.post(`/api/posts/${_id}/retweet`, {
            postedbyid,
            post,
            postedBy,

        });
        const { data } = result
        console.log(result);
        // console.log(data.likes.length);


        // if(result.status===200)
        // {
        //     window.location.reload();
        // }

    }




    return (
        // <Card >
        // <Card.Body>
        <div className="d-flex flex-column-reverse" >

            {/* <img src={profilePic}></img>
            <h2>{replyFlag}</h2>
            <h3>{timestamp}</h3>
            <h4>
                {retweetedBy}
            </h4> */}
            {/* <h1>{post.content}</h1>
            <h3>{post.likes.length}</h3>
            <h3>{post.retweetUsers.length}</h3> */}
            {/* <button onClick={() => submitLike(_id)}
                type="button"
                data-te-ripple-init
                data-te-ripple-color="light"
                class="w-20 mb-2 flex rounded px-3 py-2.5 text-xs font-medium uppercase leading-normal  shadow-md transition duration-150 ease-in-out hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg like">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up hover:shadow-lg" viewBox="0 0 16 16">
                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                </svg>
                <span
                    class=" inline-block whitespace-nowrap rounded bg-danger px-1.5 py-1 text-center align-baseline text-xs font-bold leading-none text-white"
                >{post.likes.length}</span>

            </button> */}
            <div className="social-buttons flex justify-around">
            <button onClick={() => submitLike(_id)}
                type="button"
                data-te-ripple-init
                data-te-ripple-color="light"
                class="w-20  flex rounded px-3 pt-2.5 text-xs font-medium uppercase leading-normal  transition duration-150 ease-in-out  focus:ring-0 active:shadow-lg like">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up hover:shadow-lg" viewBox="0 0 16 16">
                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                </svg>
                {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="like">
                    <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/></svg>
                 */}
                <span
                    class=" ml-1 inline-block whitespace-nowrap rounded bg-danger px-1.5 py-1 text-center align-baseline text-xs font-bold leading-none text-white"
                >{post.likes.length}</span>

            </button>
                {/* <button className="btn-like" onClick={() => submitLike(_id)}><FontAwesomeIcon icon={faHeart} /> Like</button> */}
                <button className="btn-retweet" onClick={() => submitRetweet(_id)}><FontAwesomeIcon icon={faRetweet} /> Retweet {post.retweetUsers.length}</button>
                <button className="btn-comment" onClick={() => setopenModal(true)}><FontAwesomeIcon icon={faComment} /> Comment</button>
                {openModal && <Modal
                    closeModal={setopenModal}
                    post={post}
                />}
            </div>
            <img src={profilePic}></img>
            <h2>{replyFlag}</h2>
            <h4>
                {retweetedBy}
            </h4>
            <h1>{post.content}</h1>
            <div class="flex items-center">
                <img class="w-10 h-10 rounded-full mr-4" src="https://via.placeholder.com/150" alt="Avatar"></img>
                <div>
                    <span class="font-bold text-gray-700">{name}</span>
                    <span class="text-gray-600 text-sm"> {timestamp} </span>
                </div>
            </div>
            {/*  */}
            
        </div>

        // </Card.Body>

        // </Card>


    )

}

export default SupplierPostComponent;
