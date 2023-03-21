import React, { useContext, useState } from 'react';
import { Store } from '../Store';
 import { AddAuction } from '../components/AddAuction';
 import { ProgressBar } from '../components/ProgressBar';

export const Body = () => {
    const [auction, setAuction] = useState(null);
    
    const{state}=useContext(Store)
    const{userInfo} =state
    console.log(userInfo);
  
    return (
      <div className="py-5">
        <div className="container">
        <h1>userInfo</h1>
        {auction && <ProgressBar auction={auction} setAuction={setAuction} />}
        {/* {globalMsg && <Alert variant="info">{globalMsg}</Alert>} */}
        {userInfo && <AddAuction setAuction={setAuction}/>}
  
        {/* {docs && (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
              {docs.map((doc) => {
                return <AuctionCard item={doc} key={doc.id} />;
              })}
            </div>
          )} */}
        </div>
      </div>
    );
  };