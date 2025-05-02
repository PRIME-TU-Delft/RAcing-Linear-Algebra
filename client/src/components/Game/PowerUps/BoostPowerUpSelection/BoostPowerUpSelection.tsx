import React, { useState } from 'react'
import { Box, Card, CardMedia, CardContent, Typography } from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import "./BoostPowerUpSelection.css"
import { IPowerUp } from '../PowerUpUtils'

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
        description: "Increases speed for a short duration.",
        expiryTime: Date.now(),
        type: 'boost',
        imageSrc: "https://example.com/speed-boost.png"
    },
    {
        id: 2,
        name: "Daring Boost",
        description: "Increases speed for a short duration.",
        expiryTime: Date.now(),
        type: 'boost',
        imageSrc: "https://example.com/speed-boost.png"
    },
    {
        id: 3,
        name: "Reckless Boost",
        description: "Increases speed for a short duration.",
        expiryTime: Date.now(),
        type: 'boost',
        imageSrc: "https://example.com/speed-boost.png"
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
      }, 600)
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  }

  const cardVariants = {
    initial: { scale: 1, opacity: 1 },
    selected: { scale: 1.1, opacity: 1, transition: { duration: 0.3 } },
    notSelected: { opacity: 0.3, transition: { duration: 0.3 } }
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
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
        >
          <Box display="flex" gap={2}>
            {boostOptions.map(option => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.05 }}
                variants={cardVariants}
                initial="initial"
                animate={
                  selectedId
                    ? selectedId === option.id.toString()
                      ? "selected"
                      : "notSelected"
                    : "initial"
                }
                onClick={() => handleCardClick(option)}
                style={{ cursor: "pointer" }}
              >
                <Card sx={{ width: 150, height: 150 }}>
                  <CardMedia
                    component="img"
                    image={option.imageSrc}
                    alt={option.name}
                    sx={{ width: '100%', height: 100, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ padding: 1 }}>
                    <Typography variant="subtitle1" align="center">
                      {option.name}
                    </Typography>
                    <Typography variant="body2" align="center">
                      {option.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BoostPowerUpSelection