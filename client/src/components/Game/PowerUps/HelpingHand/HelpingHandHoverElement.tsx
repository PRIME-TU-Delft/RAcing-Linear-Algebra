import React from "react"
import { HelpingHandGif } from "../PowerUpUtils";
import "./HelpingHand.css"
import Tooltip from '@mui/material/Tooltip';
import { getHelpingHandMultiplier } from "../PowerUpFunctions";

function HelpingHandHoverElement() {
    return (
        <Tooltip title={"A teammate lent you a helping hand, for a " + getHelpingHandMultiplier() + "x boost!"} arrow placement="bottom">
            <div className="helping-hand-hover-element">
                <img
                    src={HelpingHandGif}
                    alt="Helping Hand"
                    className="helping-hand-gif"
                />
            </div>
        </Tooltip>
    );
    }

export default HelpingHandHoverElement