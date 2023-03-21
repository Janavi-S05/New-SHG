import {useContext} from 'react';
import MessageBox from '../components/MessageBox';
import { Helmet } from "react-helmet-async";
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/Button";
import {BrowserRouter,Routes,Route,Link, Navigate, useNavigate} from 'react-router-dom';
import { Store } from '../Store';
import Card from 'react-bootstrap/Card';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
export default function CartScreen(){

    const navigate=useNavigate();
    const{state,dispatch:ctxDispatch}=useContext(Store);

    const{
        cart:{cartItems},
    }=state;

    // console.log(cartItems)
    // const[{product}]=cartItems
    // console.log(product)
    // const{frontLength}=product
    // console.log(frontLength)

    
    const updateCartHandler=async(item,quantity)=>{
        const{data}=await axios.get(`/api/products/${item._id}`)

        if(data.countInStock< quantity)
        {
            window.alert('Sorry.Product is out of stock');
            return;
        }
        ctxDispatch({type:'CART_ADD_ITEM',payload:{...item,quantity}})
    }

    const removeItemHandler=(item)=>{
        ctxDispatch({type:'CART_REMOVE_ITEM',payload:item});
    }

    const checkoutHandler=()=>{
        navigate('/shippingaddressscreen    ');
    };
    return(
        <div>
        {/* <Helmet>
            <title>Shopping Cart</title>
        </Helmet> */}
        <h1> Shopping Cart</h1>
        <Row>
            <Col md={8}>
                {cartItems.length===0 ?(
                    <MessageBox>
                        Cart is Empty.<Link to="/">Go Shopping</Link>
                    </MessageBox>
                ):
                (
                    <ListGroup>
                        {cartItems.map((item)=>(
                           
                            <ListGroup.Item key={item.id}>
                                <Row className="align-items-center">
                                    <Col md={4}>
                                        <img
                                        src={item.image}
                                        alt={item.name}
                                        className="img-fluid rounded img-thumbnail"></img>{' '}
                                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                    </Col>
                                    <Col md={3}>
                                        <Button variant="light"
                                         onClick={()=>updateCartHandler(item,item.quantity-1)}
                                          disabled={item.quantity===1}>
                                            <i className="fas fa-minus-circle">
                                            </i>
                                            
                                        </Button>{' '}
                                        <span>{item.quantity}</span>{' '}
                                        <Button variant="light" 
                                        onClick={()=>updateCartHandler(item,item.quantity+1)}
                                        disabled={item.quantity===item.countInStock}>
                                            <i className="fas fa-plus-circle"></i>
                                        </Button>
                                    </Col>
                                    <Col md={3}>${item.price}</Col>
                                    <Col md={2}>
                                        <Button 
                                        onClick={()=> removeItemHandler(item)}
                                        variant="light">
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    </Col>

                                </Row>
                                {/* {item.category=='Shirts'?(
                                    
                                    <Col>
                                   Front Length: <h8>{item.product.frontLength}inches</h8> <br></br>
                                   Chest: <h8>{item.product.chest}inches</h8><br></br>
                                   Across Shoulder: <h8>{item.product.acrossShoulder}inches</h8><br></br>
                                   Sleeve Length: <h8>{item.product.sleeve}inches</h8><br></br>
                                   Collar Length: <h8>{item.product.collor}inches</h8><br></br>

                                   <h8>{item.quantity}</h8>
                                </Col>
                                ):(

                                     
                                    <Col>
                                    Waist Measure: <h8>{item.product.waistMeasure}inches</h8> <br></br>
                                   Thigh Measure: <h8>{item.product.thighMeasure}inches</h8><br></br>
                                   Inseam Length: <h8>{item.product.inseamLength}inches</h8><br></br>
                                   Outseam Length: <h8>{item.product.outseamLength}inches</h8><br></br>
                                   Bottom Hem: <h8>{item.product.bottomHem}inches</h8><br></br>

                                   <h8>{item.productquantity}</h8>
                                </Col>

                                )} */}
                                
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )
                    
                }
            </Col>

            <Col md={4}>
                <Card>
                    <Card.Body>
                        <ListGroup variant="flush">
                        <ListGroup.Item>
                            <h3>
                                Subtotal ({cartItems.reduce((a,c)=>a+c.quantity,0)}{' '}
                                items):$
                                {cartItems.reduce((a,c)=>a+c.price*c.quantity,0)}
                            </h3>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="d-grid">
                                    <Button
                                    type="button"
                                    variant="primary"
                                     onClick={checkoutHandler}
                                    disabled={cartItems.length===0}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                </Card>
            </Col>
        </Row>


        </div>
    )
}