import { useState } from "react";
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

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, products: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

function ProductScreen() {

    const [{ loading, error, products }, dispatch] = useReducer(logger(reducer), {
        products: [],
        loading: true,
        error: '',
    })

    useEffect(() => {
        const fetchData = async () => {

            dispatch({ type: 'FETCH_REQUEST' });

            try {
                const result = await axios.get('/api/products');
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
            }

            catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
        };
        fetchData();
    }, []);
    console.log(products);

    return (
        <div>
            <div className="flex justify-center my-5">
                <h1 className="text-2xl font-medium border-b-2 text-slate-500">Featured Products</h1>
                {/*<div class="container mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"> */}
            </div>

                    <div  className="container">
                        {/* {
        
        loading? (<LoadingBox/>)
        :error? (<MessageBox variant="danger">{error} </MessageBox>):(
            <Row className="container mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 gap-10">
        {products.map((product)=>(
        <Col key={product.slug}  className="object-cover bg-white rounded-lg shadow-md ml-auto">
            <Product product={product}></Product>
        </Col>
        ))}
        </Row>
        )
        
      } */}
                        {/* <div className="container mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"> */}
                        {/* Product item 1 */}
                        {/* <div className="w-80 bg-white rounded-lg shadow-md mx-auto"> */}
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
      </a>
    </div> */}
                        {

                            loading ? (<LoadingBox />)
                                : error ? (<MessageBox variant="danger">{error} </MessageBox>) : (
                                    <Row>
                                        {products.map((product) => (
                                            <Col key={product.slug} className="pb-8">
                                                <Product product={product}></Product>
                                            </Col>
                                        ))}
                                    </Row>
                                )

                        }
                    </div>
                </div>
            // </div>
        // </div>
        // </div>
    )
}

export default ProductScreen;
