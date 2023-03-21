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
        <Container>
        <Row>
      <Col>
      <Card style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>Card Title</Card.Title>
        <Card.Text>
          Auction
        </Card.Text>
        {/* <Button  variant="primary">Create Auction</Button> */}
        <Link to={`/auctionscreen`}>Auction</Link>
      </Card.Body>
      </Card>
      </Col>

      <Col>
      <Card style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>Card Title</Card.Title>
        <Card.Text>
         Colloboration Page
        </Card.Text>
        <Link to={`/productscreen`}>view products</Link>
        <Button variant="primary">Check Out</Button>
      </Card.Body>
     
      </Card>
      </Col>
    </Row>


           <Row>
      <Col>
      <Card style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>Card Title</Card.Title>
        <Card.Text>
         Community Page
        </Card.Text>
        <Button variant="primary">View Feed</Button>
      </Card.Body>
      </Card>
      </Col>

      <Col>
      <Card style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>Card Title</Card.Title>
        <Card.Text>
        Synergy Index Page
        </Card.Text>
        <Button variant="primary">View Synergy Index</Button>
      </Card.Body>
     
      </Card>
      </Col>
    </Row>

    </Container>



  
    )
}