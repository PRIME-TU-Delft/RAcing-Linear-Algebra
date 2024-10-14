import React, { useState } from "react"
import "./Home.css"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear } from "@fortawesome/free-solid-svg-icons"
import { Button, Menu, Modal, TextField } from '@mui/material';
import { MenuItem } from "@mui/material"

function Home() {
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [lecturerLoginModalActive, setLecturerLoginModalActive] = useState<boolean>()
    const [loggedIn, setLoggedIn] = useState<boolean>(false)

    const handleClick = (event: React.MouseEvent<HTMLOrSVGElement>) => {
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const closeModalHandler = () => {
        setLecturerLoginModalActive(curr => false)
        setAnchorEl(null)
    }

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
                            onClick={() => setLecturerLoginModalActive(curr => true)}
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
            <Modal
                open={Boolean(lecturerLoginModalActive)}
                onClose={closeModalHandler}
                aria-labelledby="lecturer-login-modal"
                aria-describedby="lecturer-login-description"
                disableAutoFocus={true}
            >
                <div className="lecturer-login-modal rounded">
                    <p id="lecturer-login-description">Only lecturers have access to the lecturer platform. Please log in with your password.</p>
                    <form>
                        <TextField
                            id="password"
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                        >
                            Log In
                        </Button>
                    </form>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={closeModalHandler}
                        fullWidth
                        style={{ marginTop: '10px' }}
                    >
                        Back
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default Home
