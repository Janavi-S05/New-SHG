import logo from './logo.svg';
import './App.css';
//  import SignupScreen from './screens/SignupScreen';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {LinkContainer} from 'react-router-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Badge from 'react-bootstrap/Badge';
import SigninScreen from './screens/SigninScreen';
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import { Body } from './screens/AuctionScreen';
import ProductScreen from './screens/ProductScreen';
import ProductDescriptionScreen from './screens/ProductDescriptionScreen';
import { Store } from './Store';
import { useContext } from 'react';
import CartScreen from './screens/CartScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
function App() {

  
  const {state , dispatch:ctxDispatch}=useContext(Store);
  const{cart,userInfo}=state;



  const signoutHandler=()=>{
    ctxDispatch({type:'USER_SIGNOUT'});
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    localStorage.removeItem('cartItems');
    window.location.href='/';
  }
  return (
    
    <BrowserRouter>
    <header>
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
      {/* <Button
      variant="dark"
      onClick={()=>setSidebarIsOpen(!sidebarIsOpen)}
      >
        <i className="fas fa-bars"></i>
      </Button> */}
      <LinkContainer to="/home">
      <Navbar.Brand>Tailor It</Navbar.Brand>
      </LinkContainer>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
      {/* <SearchBox></SearchBox> */}
      <Nav className="me-auto w-100 justify-content-end">
        <Link to= "/cart" className="nav-link">
        Cart{
          cart.cartItems.length>0 && (
            <Badge pill bg="danger">
              {cart.cartItems.reduce((a,c)=>a+c.quantity,0)}
            </Badge>
          )
        }
        </Link>

        {userInfo ? (
          <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
            <LinkContainer to="/profile">
              <NavDropdown.Item>User Profile</NavDropdown.Item>
            </LinkContainer>

            <LinkContainer to="/orderhistory">
              <NavDropdown.Item>Order History</NavDropdown.Item>
            </LinkContainer>
            <NavDropdown.Divider/>
            <Link
            className="dropdown-item"
            to="#signout"
            onClick={signoutHandler}
            >
              Sign Out
            </Link>


          </NavDropdown>

        ):(
          <Link className="nav-link" to="/">
          Sign In
          </Link>
        )}
      </Nav>
      </Navbar.Collapse>
      </Container>
      
    </Navbar>
   
    </header>
    <Routes>
    
    <Route path="/" element={<SigninScreen/>} />
    <Route path="/signup" element={<SignupScreen/>} />
    <Route path="/home" element={<HomeScreen/>} />
    <Route path="/auctionscreen" element={<Body/>} />
    <Route path="/productscreen" element={<ProductScreen/>} />
    <Route path="/product/:slug" element={<ProductDescriptionScreen/>} />
    <Route path="/cart" element={<CartScreen/>}/>
    <Route path="/placeorderscreen" element={<PlaceOrderScreen/>}/>
    <Route path="/shippingaddressscreen" element={<ShippingAddressScreen/>}/>
    <Route path="/payment" element={<PaymentMethodScreen/>}/>
    <Route path="/placeorder" element={<PlaceOrderScreen/>}/>
    </Routes>
    </BrowserRouter>
    
  );
}

export default App;
