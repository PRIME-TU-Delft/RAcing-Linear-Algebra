import React, { useState, useEffect } from 'react';
import "./Flame.css"

interface Props {
  showAnimation: boolean
}

function FlameAnimation(props: Props) {
    const [isBurning, setIsBurning] = useState(true);

  // useEffect(() => {
  //   if (props.showAnimation) {
  //     setIsBurning(curr => true)
  //     const timer = setTimeout(() => setIsBurning(false), 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [props.showAnimation]);

  return (
    <div
      className="flame-wrapper animate__animated animate__fadeIn"
    >
      <div
        className={isBurning ? 'flame-animation' : 'flame-static'}
      ></div>
    </div>
  );
}

export default FlameAnimation;