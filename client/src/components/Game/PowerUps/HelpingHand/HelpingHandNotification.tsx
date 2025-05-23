import React, { useContext, useEffect } from "react";
import "./HelpingHand.css"
import { HelpingHandGif } from "../PowerUpUtils";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Typography } from "@mui/material";
import { HelpingHandPowerUpContext } from "../../../../contexts/PowerUps/HelpingHandPowerUpContext";


function HelpingHandNotification() {
    const helpingHandContext = useContext(HelpingHandPowerUpContext);
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        if (helpingHandContext.helpingHandReceived) {
            setOpen(true);
            setTimeout(() => {
                setOpen(false);
            }, 3000);
        }
    }, [helpingHandContext.helpingHandReceived]);

    return (
        <AnimatePresence>
      {open && (
        <motion.div
          className="helping-hand-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.92)",
              borderRadius: 3,
              px: 5,
              py: 3,
              boxShadow: 6,
              gap: 3,
              position: "relative",
              zIndex: 1001,
            }}
          >
            <motion.img
              src={HelpingHandGif}
              alt="Helping Hand"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.7, type: "spring" }}
              style={{ width: 64, height: 64 }}
            />
            <Typography
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              variant="h4"
              color="#fff"
              fontWeight={700}
              sx={{ px: 2, letterSpacing: 1.5, textAlign: "center" }}
            >
              Helping Hand Received!
            </Typography>
            <motion.img
              src={HelpingHandGif}
              alt="Helping Hand"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1, rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.7, type: "spring" }}
              style={{ width: 64, height: 64 }}
            />
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
    );
    }

export default HelpingHandNotification;