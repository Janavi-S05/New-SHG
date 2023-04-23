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
import Post from './screens/Post';
import FeedScreen from './screens/FeedScreen';
import ProductDescriptionScreen from './screens/ProductDescriptionScreen';
import { Store } from './Store';
import { useContext } from 'react';
import CartScreen from './screens/CartScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';

import Home from './screens/HomeScreen';
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
    
    <BrowserRouter className="bg-gray-100">
    <header className="border-b shadow-md ">
    <Navbar expand="lg">
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
      {/* <div className="container mx-auto flex justify-between items-center py-2">
      <ul className="flex items-center">
        <li className="-mb-px mr-1">
          <a
            href="#"
            className="border-b bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-700 font-semibold text-gray-400 font-bold hover:text-white px-3 py-2"
          >
            HOME
          </a>
        </li>
        <li>
          <a
            href="#"
            className="text-gray-400 font-bold hover:text-white px-3 py-2"
          >
            PRODUCTS
          </a>
        </li>
        <li>
          <a
            href="#"
            className="text-gray-400 font-bold hover:text-white px-3 py-2"
          >
            COMMUNITY
          </a>
        </li>
        <li>
          <a
            href="#"
            className="text-gray-400 font-bold hover:text-white px-3 py-2"
          >
            AUCTION
          </a>
        </li>
      </ul>
      </div> */}
      <Nav className="me-auto w-100 justify-content-end">
      {/* <div className="flex"> */}
      {/* <ul className="flex items-center"> */}
        {/* <li className="-mb-px mr-1"> */}
          <Link
            href="/home"
            className="border-b inline-block border-l border-t border-r rounded-t text-blue-500 font-semibold  font-bold hover:text-gray-400 nav-link py-2 px-3 mx-2"
          >
            HOME
          </Link>
        {/* </li> */}
        {/* <li> */}
          <Link
            to={`/productscreen`}
            className="bg-white inline-block   font-semibold text-blue-500 font-bold hover:text-gray-400 nav-link py-2 px-3 mx-2"
          >
            PRODUCTS
          </Link>
        {/* </li> */}
        {/* <li> */}
          <Link
            to={`/feedScreen`}
            className="bg-white inline-block font-semibold text-blue-500 font-bold hover:text-gray-400 nav-link py-2 px-3 mx-2"
          >
            COMMUNITY
          </Link>
        {/* </li> */}
        {/* <li> */}
          <Link
           to={`/auctionscreen`}
            className="bg-white inline-block font-semibold text-blue-500 font-bold hover:text-gray-400   nav-link py-2 px-3 mx-2"
          >
            AUCTION
          </Link>
        {/* </li> */}
      {/* </ul> */}
      {/* </div> */}
        <Link to= "/cart" className="nav-link">
        Cart{
          cart.cartItems.length>0 && (
            <Badge pill bg="warning">
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
    {/* <hr className="h-2  bg-black-200 border-0 dark:bg-gray-700 w-85"></hr> */}
    </header>
    {/* <hr className="h-2  bg-black-200 border-0 dark:bg-gray-700 w-85"></hr> */}
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
    <Route path="/myhome" element={<Home/>}/>
    {/* <Route path="/Post" element={<Post/>}/> */}
    <Route path="/feedScreen" element={<FeedScreen/>}/>
    </Routes>
    </BrowserRouter>
    
  );
}

export default App;
