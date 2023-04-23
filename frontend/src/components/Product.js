import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
// import Rating from "./Rating";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";
import Rating from "./Rating";
function Product(props){

    const{product}=props;
    console.log(product);



    const{state,dispatch:ctxDispatch}=useContext(Store);

    const{
        cart:{cartItems},
    }=state;
    const addToCartHandler=async(item)=>{
        const existItem=cartItems.find((x)=>x.id===product.id);
        const quantity=existItem? existItem.quantity+1:1
        const{data}=await axios.get(`/api/products/${item._id}`)

        if(data.countInStock< quantity)
        {
            window.alert('Sorry.Product is out of stock');
            return;
        }
        ctxDispatch({type:'CART_ADD_ITEM',payload:{...item,quantity}})
    }


    return(
        <div  className="w-72 bg-white rounded-lg shadow-md mx-auto drop-shadow-md">
            {/* <img
      src="https://via.placeholder.com/640x480"
      alt="Product image"
      className="w-full h-64 object-cover rounded-t-lg"
    />
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-2">Product Title</h1>
      <p className="text-gray-600 text-lg mb-5">Price: $99.99</p>
      <a
        href="#"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        View details
      </a> */}
  

        <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="w-full h-52 object-fit rounded-t-lg" alt={product.name} />
        </Link>

        <div className="py-2 px-3">
            <Link to={`/product/${product.slug}`}>
            <h1 className="text-2xl font-bold mb-2 ">{product.name}</h1>
            </Link>
           
            <Rating rating={product.rating} numReviews={product.numReviews}></Rating>
            <h2 className="text-gray-600 text-lg mb-1">${product.price}</h2>
            <div className="justify-center flex pb-2"><Button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors " onClick={()=>addToCartHandler(product)}>Add to cart</Button></div>
          

        </div>
    
        </div>
        
      
    )

}

export default Product;
