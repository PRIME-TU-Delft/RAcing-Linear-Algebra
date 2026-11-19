# RAcing Linear Algebra 18a

Racing Linear Algebra is a web-based game that combines racing gameplay with challenges related to linear algebra concepts, this game is to be incorporated into math lectures to increase students’ engagement while helping them improve their math skills.

## Project Structure

This project consists of two main components:

- Frontend: Contains the web application interface built with React.
- Backend: Provides the server-side logic and API built with Node.js.

## Instalation Guide 

To run the application you will need to setup both frontend and backend.

### Frontend (client side)

For detailed information about the frontend, including installation instructions and usage, please refer to the [Frontend README](client/README.md).

### Backend (server side)

For detailed information about the backend, including installation instructions and usage, please refer to the [Backend README](server/README.md).

## Offline demo (conferences, open days)

A self-contained, single-player demo lives at `/demo`. It needs no backend, database, Grasple or internet connection: questions, ghost teams and scoring all run in the browser.

```bash
cd client
pnpm install          # once, while online
pnpm start            # then open http://localhost:3000/demo
```

- A round lasts 2 minutes: a warm-up question, then the player picks easy / medium / hard questions (10 / 50 / 150 points, streak multipliers up to 1.5x) and races 5 simulated ghost teams.
- "Lecture-hall screen" (or the `L` key) shows the full projector map that a lecturer would put on screen.
- The results screen lists what the full game offers lecturers and returns to the start screen after 60 seconds.
- Optional URL parameters: `/demo?duration=90&lap=300` (round length in seconds, points per lap).
- The ⛶ button on the start screen toggles fullscreen.

## Authors and acknowledgement

### Team Members

- Boris Pavić
- Dorian Erhan
- Yanzhi Chen
- Konstantinos Stergiou
- Jarno Berger

### Client

- PRIME

### Teaching Assistant

- Ana Băltăreţu
