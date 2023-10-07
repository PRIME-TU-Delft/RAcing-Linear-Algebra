import React, { useEffect } from "react"
import "./WarningModal.css"
import Modal from 'react-bootstrap/Modal';
import { Button } from "react-bootstrap";

interface Props {
    message: string
    title: string
    onLeaveGame: () => void
    onCloseModal: () => void
}

function WarningModal(props: Props) {
    return(
        <div>
            <Modal show={true}>
                <Modal.Header>
                    <Modal.Title>{props.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                <p>{props.message}</p>
                </Modal.Body>

                <Modal.Footer>
                <Button variant="danger" onClick={() => props.onLeaveGame()}>Quit</Button>
                <Button variant="primary" onClick={() => props.onCloseModal()}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default WarningModal