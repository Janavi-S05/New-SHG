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
        <div >

        <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
        </Link>

        <div>
            <Link to={`/product/${product.slug}`}>
            <h1>{product.name}</h1>
            </Link>
           
            <Rating rating={product.rating} numReviews={product.numReviews}></Rating>
            <Card.Text>${product.price}</Card.Text>
            <Button onClick={()=>addToCartHandler(product)}>Add to cart</Button>
          

        </div>
    
        </div>
        
      
    )

}

export default Product;