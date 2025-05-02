import React, { useState } from 'react'
import { Box, Card, CardMedia, Typography } from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import "./BoostPowerUpSelection.css"
import { DaringBoostIcon, IPowerUp, RecklessBoostIcon, SteadyBoostIcon } from '../PowerUpUtils'

interface Props {
  onSelectionComplete: (selectedBoost: IPowerUp) => void
}

function BoostPowerUpSelection(props: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [overlayExited, setOverlayExited] = useState(false)

  const boostOptions: IPowerUp[] = [
    {
      id: 1,
      name: "Steady Boost",
      description: "Slow but steady. Grants a permanent 1.1x boost to your score.",
      expiryTime: Date.now(),
      type: 'boost',
      imageSrc: SteadyBoostIcon
    },
    {
      id: 2,
      name: "Daring Boost",
      description: "Risky, but rewarding. Grants a 1.3x boost to your score when your streak is 3 or more.",
      expiryTime: Date.now(),
      type: 'boost',
      imageSrc: DaringBoostIcon
    },
    {
      id: 3,
      name: "Reckless Boost",
      description: "Surely a bad idea, right? Grants a 1.8x boost to your score when your streak is 5 or more.",
      expiryTime: Date.now(),
      type: 'boost',
      imageSrc: RecklessBoostIcon
    }
  ]

  const handleCardClick = (option: IPowerUp) => {
    if (!selectedId) {
      setSelectedId(option.id.toString())
      setTimeout(() => {
        setOverlayExited(true)
        setTimeout(() => {
          props.onSelectionComplete(option)
        }, 300)
      }, 400)
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  }

  const cardVariants = {
    initial: (i: number) => ({
      opacity: 0,
      scale: 0.9,
      transition: { delay: i * 0.3, duration: 0.3 }
    }),
    animate: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.3, duration: 0.3 }
    }),
    selected: { scale: 1.05, opacity: 1, transition: { duration: 0.3 } },
    notSelected: { opacity: 0, transition: { duration: 0.3 } }
  }

  const getGlowValue = (option: IPowerUp) => {
    switch(option.id) {
        case 1:
            return "0 0 50px rgba(0, 213, 255, 0.5)";
        case 2:
            return "0 0 50px rgba(255, 0, 217, 0.64)";
        case 3:
            return "0 0 50px rgba(157, 0, 255, 0.5)";
        default:
            return "0 0 50px rgba(255, 255, 255, 0.5)";
    }
  }

  return (
    <AnimatePresence>
      {!overlayExited && (
        <motion.div
          className="boost-overlay"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '13%', 
            zIndex: 1300,
          }}
        >
          <Box display="flex" gap={5}>
            {boostOptions.map((option, index) => (
              <motion.div
                key={option.id}
                custom={index}
                variants={cardVariants}
                initial="initial"
                animate={
                  selectedId
                    ? selectedId === option.id.toString()
                      ? "selected"
                      : "notSelected"
                    : "animate"
                }
                whileHover={{ boxShadow: getGlowValue(option)}}
                onClick={() => handleCardClick(option)}
                className='boost-powerup-card'
              >
                <Card sx={{ width: 180, height: 180 }}>
                  <CardMedia
                    component="img"
                    image={option.imageSrc}
                    alt={option.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'black' }}
                  />
                </Card>
                <Box mt={1} textAlign="center" sx={{ maxWidth: 250 }}>
                  <div className="boost-powerup-title">{option.name}</div>
                    <div className="boost-powerup-description">{option.description}</div>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BoostPowerUpSelection