import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
export default function CheckoutSteps(props)
{
    // my-8 w-6/12 mx-auto
    return <Row className="checkout-steps container small-container my-8 mx-auto pl-0">
        <Col className={props.step1 ? 'active' : ''} ><h1 className="text-lg pb-3">Sign-In</h1></Col>
        <Col className={props.step2 ? 'active' : ''}><h1 className="text-lg">Shipping</h1></Col>
        <Col className={props.step3 ? 'active' : ''}><h1 className="text-lg">Payment</h1></Col>
        <Col className={props.step4 ? 'active' : ''}><h1 className="text-lg ">Place Order</h1></Col>
    </Row>
}
