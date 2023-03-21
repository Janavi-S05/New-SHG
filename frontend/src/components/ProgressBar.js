import React, { useEffect,useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
// import useStorage from '../../hooks/useStorage';

export const ProgressBar = ({ auction, setAuction }) => {
  
//   const { progress, isCompleted } = useStorage(auction);
console.log(auction);


  

//   useLayoutEffect(() => {
    
//     if (isCompleted) {
//       setAuction(null);
//     }
//     console.log("hi");
//   }, [isCompleted, setAuction]);

  return (
    <motion.div
      style={{ height: '5px', background: 'black' }}
      initial={{ width: 0 }}
      animate={{ width: `${0}%` }}
    />
  );
};