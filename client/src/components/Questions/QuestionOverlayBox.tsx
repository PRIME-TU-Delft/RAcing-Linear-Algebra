import React, { useEffect, useState } from "react";
import "./QuestionOverlayBox.css";
import { propTypes } from "react-bootstrap/esm/Image";
import { motion } from "framer-motion";

interface Props {
    margin: number
    questionStarted: boolean
    show?: boolean
    openOnStart?: boolean
    staysOpen?:boolean
    openDuration?: number
    openOnHover?: boolean
    isAction?: boolean
    onBoxClicked?: () => void
    closedText?: string
    openText?: string
    boxContent?: React.ReactNode    // Custom HTML to show inside the overlay box
}

const QuestionOverlayBox: React.FC<Props> = ({
    margin,
    questionStarted,
    show = true,            // by default we want the overlay box to be shown, unless specified otherwise 
    openOnStart = false,    // don't want it to open on start by default
    staysOpen = false,
    openDuration = 3,
    openOnHover = false,     // don't want it to be hoverable by default
    isAction = false,
    onBoxClicked = () => {},
    closedText = "",
    openText = "",
    boxContent
}) => {
    const [overlayIsOpen, setOverlayIsOpen] = useState<boolean>(false)

    const overlayWidth = 200
    const overlayHeight = 100
    const strokeWidth = 5

    useEffect(() => {
        if (questionStarted) {
            if (openOnStart) {
                openOverlayBoxOnStart()
            }
        }
    }, [questionStarted])

    const openOverlayBoxOnStart = () => {
        setOverlayIsOpen(true);
        if (!staysOpen) {
            setTimeout(() => {
                setOverlayIsOpen(false);
            }, 3000);
        }
    }

    const getOverlayOpenClassValue = (): string => {
        if (overlayIsOpen) {
            return "overlay-open "
        } else {
            return "overlay-closed "
        }
    }

    const handleOverlayBoxHover = () => {
        if (openOnHover) {
            setOverlayIsOpen(curr => true)
        }
    }

    const handleOverlayBoxMouseLeave = () => {
        if (!staysOpen) {
            setOverlayIsOpen(curr => false)
        }
    }

    const draw = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { type: "spring", duration: 1.5, bounce: 0, repeat: Infinity, repeatType: "loop", repeatDelay: 0.3 },
                opacity: { duration: 0.01 },
            },
        },
    };

    const getTopBorderPath = () => {
        const halfWidth = Math.floor(overlayWidth / 2);
        const offsetWidth = halfWidth - strokeWidth - 2;
        const borderRadius = 10;

            const res = `
                     M ${-offsetWidth + strokeWidth - 2} ${offsetWidth / 2} 
                     L ${-offsetWidth + 2.5} ${strokeWidth + borderRadius - 2.5}
                     A ${borderRadius} ${borderRadius} 0 0 1 ${-offsetWidth + strokeWidth + borderRadius - 2.5} ${strokeWidth - 2}
                     L ${offsetWidth * 2 - strokeWidth - 2} ${strokeWidth - 2} 
                     A ${borderRadius} ${borderRadius} 0 0 1 ${offsetWidth * 2 + strokeWidth - 1} ${strokeWidth + borderRadius - 2} 
                     L ${offsetWidth * 2 + strokeWidth - 1} ${offsetWidth / 2 + borderRadius + 2} 
                     `
        return res
    }
    
    const getBottomBorderPath = () => {
        const halfWidth = Math.floor(overlayWidth / 2);
        const offsetWidth = halfWidth - strokeWidth;
        const borderRadius = 10;
        const res = `M ${offsetWidth * 2} ${offsetWidth / 2 + borderRadius - 1.5}
                     L ${offsetWidth * 2} ${offsetWidth - borderRadius + 1}
                     A ${borderRadius} ${borderRadius} 0 0 1 ${offsetWidth * 2 - borderRadius - strokeWidth + 4} ${offsetWidth + 2.5} 
                     L ${-offsetWidth + strokeWidth + borderRadius } ${offsetWidth + 2.5} 
                     A ${borderRadius} ${borderRadius} 0 0 1 ${-offsetWidth + strokeWidth} ${offsetWidth - borderRadius + 2}
                     L ${-offsetWidth + strokeWidth} ${offsetWidth / 2 - 2} 
                     `
        return res
    }

    const getClickableHoverClass = () => {
        if (isAction) {
            return "clickable-overlay "
        } else {
            return ""
        }
    }

    const getMarginStyle = () => {
        // Actions appear on the bottom, and information boxes on top
        if (isAction) {
            return {
                bottom: `${margin}px`
            }
        } else {
            return {
                top: `${margin}px`
            }
        }
    }

    return (
        <div 
            className={"question-overlay-box " + getOverlayOpenClassValue() + getClickableHoverClass()} 
            style={getMarginStyle()}
            onMouseEnter={handleOverlayBoxHover}
            onMouseLeave={handleOverlayBoxMouseLeave}>
                {overlayIsOpen && isAction && (<svg className="animated-border" viewBox="0 0 100 100">
                    <motion.path
                        d={getTopBorderPath()}
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        initial="hidden"
                        animate="visible"
                        variants={draw}
                        custom={1}
                    />
                    <motion.path
                        d={getBottomBorderPath()}
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        initial="hidden"
                        animate="visible"
                        variants={draw}
                        custom={1}
                    />
                </svg>)}
                <div className="overlay-text">
                    <div className="open-text">
                        {openText}
                    </div>
                    <div className="closed-text">
                        {closedText}
                    </div>
                </div>
                {boxContent && <div className="box-content">{boxContent}</div>}
        </div>
    );
};

export default QuestionOverlayBox;