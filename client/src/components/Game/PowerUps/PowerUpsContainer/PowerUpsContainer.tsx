import React, { useEffect, useState } from "react";
import "./PowerUpsContainer.css"
import PowerupsContainerIcon from "../../../../img/powerups-container-icon.png"
import PowerUpElement from "../PowerUpElement/PowerUpElement";
import { IPowerUp } from "../PowerUpUtils";
import { AnimatePresence, motion } from "framer-motion";

function PowerUpsContainer() {
  const [powerUps, setPowerUps] = useState<IPowerUp[]>([]);
  const maxPowerUps = 3;

  useEffect(() => {
    if (powerUps.length > maxPowerUps) {
      const expiringPowerUp = powerUps[0]
      removePowerUp(expiringPowerUp)
    }
  }, [powerUps]);

  const addNewPowerUp = (powerUp: IPowerUp) => {
    setPowerUps((prevPowerUps) => [...prevPowerUps, powerUp]);
  }

  const usePowerUp = (powerUp: IPowerUp) => {
    if (powerUps.find(p => p == powerUp) != undefined) {
      removePowerUp(powerUp)
    }
  }

  const removePowerUp = (powerUp: IPowerUp) => {
    const filteredPowerUps = powerUps.filter(p => p != powerUp)
    setPowerUps(curr => [...filteredPowerUps])
  }

  return (
    <div className="power-ups-container d-flex">
      <div className="btn btn-primary fixed-bottom" onClick={() => addNewPowerUp({id: Math.random() * 10000,name: "AA", description: "SS", expiryTime: Date.now() + 15000})}>ADD</div>
        <div className="container d-flex justify-content-end align-items-center">
            <AnimatePresence>
                {powerUps.map((powerUp) => (
                  <motion.div
                    key={powerUp.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    
                    transition={{ 
                      duration: 0.3,
                      exit: { duration: 0.6 }
                    }}
                  >
                    <PowerUpElement 
                        onClick={() => usePowerUp(powerUp)} 
                        powerUp={powerUp}
                        onPowerUpExpired={() => removePowerUp(powerUp)}
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
        </div>

        <div className="container-symbol-element d-flex justify-content-center align-items-center">
            <img className="symbol-image" src={PowerupsContainerIcon} alt="" />
        </div>
    </div>
  )
}

export default PowerUpsContainer