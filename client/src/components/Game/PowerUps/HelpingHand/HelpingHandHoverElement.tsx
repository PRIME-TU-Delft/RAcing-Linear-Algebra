import React from "react"
import { HelpingHandGif } from "../PowerUpUtils";
import "./HelpingHand.css"
import Tooltip from '@mui/material/Tooltip';
import { getHelpingHandMultiplier } from "../PowerUpFunctions";

interface Props {
    open: boolean
}
function HelpingHandHoverElement(props: Props) {
    return (
        <Tooltip title={"A teammate lent you a helping hand, for a " + getHelpingHandMultiplier() + "x boost!"} arrow placement="bottom">
            <div className="helping-hand-hover-element">
                {props.open && (
                    <img
                    src={HelpingHandGif}
                    alt="Helping Hand"
                    className="helping-hand-gif"
                />
                )}
            </div>
        </Tooltip>
    );
    }

export default HelpingHandHoverElement