import React, { useContext, useEffect, useState } from "react";
import "./PowerUpsContainer.css"
import PowerupsContainerIcon from "../../../../img/powerups-container-icon.png"
import PowerUpElement from "../PowerUpElement/PowerUpElement";
import { BaseBoost, IPowerUp, TemplatePowerUp } from "../PowerUpUtils";
import { AnimatePresence, motion } from "framer-motion";
import { PowerUpContext } from "../../../../contexts/PowerUpContext";

interface Props {
  onGenericBoostPowerUpUsed: () => void
  boostSelected: boolean
}

function PowerUpsContainer(props: Props) {
  const powerupContext = useContext(PowerUpContext)
  const [powerUps, setPowerUps] = useState<IPowerUp[]>([]);
  const [genericBoostRef, setGenericBoostRef] = useState<IPowerUp | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const maxPowerUps = 3;

  useEffect(() => {
    if (powerUps.length > maxPowerUps) {
      const expiringPowerUp = powerUps[0]
      removePowerUp(expiringPowerUp)
    }
  }, [powerUps]);

  useEffect(() => {
    if (props.boostSelected && genericBoostRef) {
      removePowerUp(genericBoostRef)
    }
  }, [props.boostSelected, genericBoostRef]);

  useEffect(() => {
    if (powerupContext.playerUnlockedBoost) {
      addNewPowerUp(BaseBoost)
    }
  }, [powerupContext.playerUnlockedBoost])

  const showNotificationIfBoostUnlocked = (powerUp: IPowerUp) => {
    if (powerUp.type == 'boost') {
      setTimeout(() => {
        setShowNotification(true)
        setTimeout(() => {
          setShowNotification(false)
        }, 4000);
      }, 300);
    }
  }

  const addNewPowerUp = (powerUp: IPowerUp) => {
    if (powerUp.duration != undefined) {
      powerUp.expiryTime = Date.now() + (powerUp.duration * 1000)
    }
    setPowerUps((prevPowerUps) => [...prevPowerUps, powerUp]);
    showNotificationIfBoostUnlocked(powerUp)
  }

  const usePowerUp = (powerUp: IPowerUp) => {
    if (powerUps.find(p => p == powerUp) != undefined) {
      switch (powerUp.type) {
        case 'boost':
          props.onGenericBoostPowerUpUsed()
          setGenericBoostRef(powerUp)
          break;
        default:
          removePowerUp(powerUp)
          break;
      }
    }
  }

  const removePowerUp = (powerUp: IPowerUp) => {
    const filteredPowerUps = powerUps.filter(p => p != powerUp)
    setPowerUps(curr => [...filteredPowerUps])
  }

  return (
    <>
      <div className="power-ups-container d-flex">
        <div className="container d-flex col testing-container">
          <div className="btn btn-primary testing-btn"  onClick={() => addNewPowerUp(BaseBoost)}>Add Boost</div>
          <div className="btn btn-primary testing-btn"  onClick={() => addNewPowerUp(TemplatePowerUp)}>Add Default</div>
        </div>
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
      <AnimatePresence>
          {showNotification && (
            <motion.div
              className="boost-available-notification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="notification-visual-pointer"></div>
              Click to activate power-up!
            </motion.div>
          )}
      </AnimatePresence>
    </>
  )
}

export default PowerUpsContainer