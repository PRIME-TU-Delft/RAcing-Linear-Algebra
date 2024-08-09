import React, { useState, useEffect } from 'react';
import "./Flame.css"

function FlameAnimation() {
    const [isBurning, setIsBurning] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => setIsBurning(false), 1000);
//     return () => clearTimeout(timer);
//   }, []);

  return (
    <div
      className="flame-wrapper  animate__animated animate__fadeIn"
      style={{
        scale: `0.15` /* Scale based on original size */
      }}
    >
      <div
        className={isBurning ? 'flame-animation' : 'flame-static'}
      ></div>
    </div>
  );
}

export default FlameAnimation;