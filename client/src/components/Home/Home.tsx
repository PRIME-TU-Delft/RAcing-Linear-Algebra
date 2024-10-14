import React, { useState } from "react"
import "./Home.css"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear } from "@fortawesome/free-solid-svg-icons"
import { Menu } from '@mui/material';
import { MenuItem } from "@mui/material"

function Home() {
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleClick = (event: React.MouseEvent<HTMLOrSVGElement>) => {
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    return (
        <>
            <div className="background"> </div>
            <div className="home">
                <div className="home-title">
                    <p>RAcing Linear Algebra</p>
                </div>
                <div className="settings-dropdown">
                    <FontAwesomeIcon 
                        icon={faGear} 
                        size="2xl" 
                        className="settings-icon" 
                        onClick={handleClick}
                    />
                    <Menu
                        id="settings-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        autoFocus={false}
                    >
                        <MenuItem 
                            onClick={() => navigate("/LecturerPlatform")}
                            selected={false}>
                            Lecturer platform
                        </MenuItem>
                    </Menu>
                </div>
                <div className="home-buttons">
                    <button
                        className="home-btn"
                        onClick={() => navigate("/CreateGame")}
                    >
                        <p>Create Game</p>
                    </button>

                    <button
                        className="home-btn"
                        onClick={() => navigate("/JoinGame")}
                    >
                        <p>Join Game</p>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Home
