import { useContext, useState } from "react";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from "axios";
// import LoadingBox from "../components/LoadingBox";
// import MessageBox from "../components/MessageBox";
import Product from "../components/Product";
import { useEffect } from "react";
import { useReducer } from "react";
import logger from 'use-reducer-logger';
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Rating from "../components/Rating";
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { Button } from "react-bootstrap";
import { Store } from "../Store";




const reducer=(state,action)=>{
    switch(action.type)
    {
        case 'FETCH_REQUEST':
            return{...state,loading:true};
        case 'FETCH_SUCCESS':
            return{...state,product:action.payload,loading:false};
        case 'FETCH_FAIL':
            return{...state,loading:false,error:action.payload};
        default:
            return state;
    }
}

function ProductDescriptionScreen()
{
    const navigate=useNavigate();
    const params=useParams();
    const {slug}=params;
    


    const[{loading,error,product}, dispatch]=useReducer(logger(reducer),{
        product:[],
         loading:true,
         error:'',
     })


     useEffect(()=>{
        const fetchData=async()=>
        {
            
            dispatch({type:'FETCH_REQUEST'});
            
            try{
                const result=await axios.get(`/api/products/slug/${slug}`);
                dispatch({type:'FETCH_SUCCESS',payload:result.data});
            }

            catch(err)
            {
                dispatch({type:'FETCH_FAIL',payload:err.message});
            }
                
        
             
        };
        fetchData();
    },[slug]);


    const{state, dispatch: ctxDispatch}=useContext(Store);
    const{cart}=state
    const addToCartHandler=async(item)=>{
        const existItem=cart.cartItems.find((x)=>x.id===product.id);
        const quantity=existItem? existItem.quantity+1:1
        const{data}=await axios.get(`/api/products/${product._id}`)
        if(data.countInStock< quantity)
        {
            window.alert('Sorry.Product is out of stock');
            return;
        }
        ctxDispatch({type:'CART_ADD_ITEM',payload:{...product,quantity:1}})

        navigate('/cart')
    }

    


    return loading? (<LoadingBox/>)
    :error? (<MessageBox variant="danger">{error} </MessageBox>)  : (

<Row>
                <Col md={6}>
                    <img
                    className="img-large"
                    src={product.image}
                    alt={product.name}
                    >

                    </img>
                </Col>
                    <Col md={3}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                      
                            <h1>{product.name}</h1>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Rating
                                rating={product.rating}
                                numReviews={product.numReviews}
                            />
                        </ListGroup.Item>
                        <ListGroup.Item>Price : ${product.price}</ListGroup.Item>
                        <ListGroup.Item>
                            Description:
                            <p>{product.description}</p>
                        </ListGroup.Item>
                    </ListGroup>
                    </Col>

                    <Col md={3}>
                    <Card>
                    <Card.Body>
                        <ListGroup variant="flush">
                        <ListGroup.Item>
                            <Row>
                                <Col>Price:</Col>
                                <Col>${product.price}</Col>
                            </Row>
                            
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Status:</Col>
                                <Col>{product.countInStock>0?(
                                <Badge bg="success">In Stock</Badge>
                                ):(
                                <Badge bg="danger">Out of Stock</Badge>
                                )}</Col>
                            </Row>
                            </ListGroup.Item>

                            {product.countInStock>0 && (
                                <ListGroup.Item>
                                    <div className="d-grid">
                                        <Button onClick={addToCartHandler} variant="primary"> 
                                            Add To Cart
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card.Body>
                    </Card>
                    </Col>
                    
                        

</Row>

    )
    



}

export default ProductDescriptionScreen;