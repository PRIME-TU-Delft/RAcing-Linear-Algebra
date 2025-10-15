import React, { useEffect } from "react";
import "./CheckpointNotification.css"

// Sprites
import NotificationStrip from "../../../img/notification_strip.png"
import Seagull from "../../../img/maps/train/seagull_fly.gif"
import DelftsBlauw from "../../../img/maps/train/blauw.png"
import Cheese from "../../../img/maps/train/cheese.png"
import Skyscraper from "../../../img/maps/train/skyscraper.png"

interface Props {
	checkpointName?: string
}

function CheckpointNotification(props: Props) {
	const [visible, setVisible] = React.useState(false)

	useEffect(() => {
		if (props.checkpointName) {
			setVisible(true)
			const timer = setTimeout(() => {
				setVisible(false)
			}, 5000)

			return () => clearTimeout(timer)
		}
	}, [props.checkpointName])

	const getSpriteForCheckpoint = (name: string) => {
		switch(name) {
			case "The Hague":
				return Seagull
			case "Delft":
				return DelftsBlauw
			case "Gouda":
				return Cheese
			case "Rotterdam":
				return Skyscraper
			default:
				return ""
		}
	}

	return (
		<div className={`checkpoint-notification-container ${visible ? "show-checkpoint" : "hide-checkpoint"}`}>
			<img 
				src={NotificationStrip} 
				alt="Notification Background" 
				className="checkpoint-notification-background"
			/>
			<div className="checkpoint-notification-title">
				{props.checkpointName}
			</div>
			{props.checkpointName && 
			<img 
				src={getSpriteForCheckpoint(props.checkpointName)} 
				alt="Checkpoint Icon" 
				className="checkpoint-notification-icon"
			/>}
		</div>
	)
}

export default CheckpointNotification;