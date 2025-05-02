import React, { useMemo, useEffect } from "react"
import { useTimer } from "react-timer-hook"
import { motion } from "framer-motion"
import { IPowerUp } from "../PowerUpUtils"
import "./PowerUpElement.css"

interface Props {
  onClick: () => void
  powerUp: IPowerUp
  onPowerUpExpired: () => void
}

function PowerUpElement(props: Props) {
  const expiryTimestamp = useMemo(() => new Date(props.powerUp.expiryTime), [props.powerUp.expiryTime])

  const { seconds, minutes, restart } = useTimer({
    expiryTimestamp,
    autoStart: true,
    onExpire: props.onPowerUpExpired
  })

  useEffect(() => {
    restart(expiryTimestamp)
  }, [expiryTimestamp, restart])

  const timeFormatted = `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`

  const totalSeconds = minutes * 60 + seconds
  const isExpiring = totalSeconds <= 10

  const cycleDuration = 1
  const now = performance.now() / 1000
  const delay = -(now % cycleDuration)

  return (
    <motion.div
      className="power-up-element"
      onClick={props.onClick}
      animate={isExpiring ? { opacity: [1, 0.7, 1], scale: [1, 0.95, 1] } : {}}
      transition={
        isExpiring
          ? {
              duration: cycleDuration,
              repeat: Infinity,
              ease: "linear",
              delay
            }
          : {}
      }
      style={{ position: "relative", boxShadow: "0 0 10px rgb(255, 255, 255)" }}
      
    >
        <img
        src={props.powerUp.imageSrc}
        alt={props.powerUp.name}
        className="powerup-overlay-icon"
      />
      <div className="expiry-timer">{timeFormatted}</div>
    </motion.div>
  )
}

export default PowerUpElement