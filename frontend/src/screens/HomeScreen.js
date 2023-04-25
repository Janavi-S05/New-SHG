import React from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { Body } from "./AuctionScreen";
import { Link } from "react-router-dom";

export default function HomeScreen()
{
    return(
    //     <Container>
    //     <Row>
    //   <Col>
    //   <Card style={{ width: '18rem' }}>
    //   <Card.Body>
    //     <Card.Title>Card Title</Card.Title>
    //     <Card.Text>
    //       Auction
    //     </Card.Text>
    //     {/* <Button  variant="primary">Create Auction</Button> */}
    //     <Link to={`/auctionscreen`}>Auction</Link>
    //   </Card.Body>
    //   </Card>
    //   </Col>

    //   <Col>
    //   <Card style={{ width: '18rem' }}>
    //   <Card.Body>
    //     <Card.Title>Card Title</Card.Title>
    //     <Card.Text>
    //      Colloboration Page
    //     </Card.Text>
    //     <Link to={`/productscreen`}>view products</Link>
    //     <Button variant="primary">Check Out</Button>
    //   </Card.Body>
     
    //   </Card>
    //   </Col>
    // </Row>


    //        <Row>
    //   <Col>
    //   <Card style={{ width: '18rem' }}>
    //   <Card.Body>
    //     <Card.Title>Card Title</Card.Title>
    //     <Card.Text>
    //      Community Page
    //     </Card.Text>
    //     <Button variant="primary">View Feed</Button>
    //   </Card.Body>
    //   </Card>
    //   </Col>

    //   <Col>
    //   <Card style={{ width: '18rem' }}>
    //   <Card.Body>
    //     <Card.Title>Card Title</Card.Title>
    //     <Card.Text>
    //     Synergy Index Page
    //     </Card.Text>
    //     <Button variant="primary">View Synergy Index</Button>
    //   </Card.Body>
     
    //   </Card>
    //   </Col>
    // </Row>

    // </Container>
    <div className="container mx-auto mt-12 flex flex-wrap items-center">
  {/* Paragraph */}
  <div className="w-full lg:w-1/2 lg:pl-10 mt-10 lg:mt-0">
    <h1 className="text-3xl font-bold mb-5">
      Platform for SHGs to buy high <br />
      quality raw materials from trusted <br />
      sellers.
    </h1>
    <p className="text-gray-600 leading-loose">
      we make it easier for SHGs to source the <br />
      materials they need to create their products.
    </p>
  </div>
  {/* Image */}
  <div className="w-full lg:w-1/2 lg:pr-10">
    <img
      src="https://via.placeholder.com/640x480"
      alt="Placeholder image"
      className="rounded-lg max-w-md"
    />
  </div>
</div>
    // <div class="container mx-auto mt-12 flex flex-wrap items-center bg-gray-100">
      
     
    //   <div class="w-full lg:w-1/2 lg:pl-10 mt-10 lg:mt-0">
    //     <h1 class="text-3xl font-bold mb-5">Platform for SHGs to buy high <br/>quality raw materials from trusted <br/>sellers.</h1>
    //     <p class="text-gray-600 leading-loose">we make it easier for SHGs to source the <br/>materials they need to create their products.</p>
    //   </div>
    //   <div class="w-full lg:w-1/2 lg:pr-10">
    //     <img src="https://via.placeholder.com/640x480" alt="Placeholder image" class="rounded-lg max-w-md"></img>
    //   </div>
    // </div>



  
    )
}
