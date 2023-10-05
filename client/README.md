# RAcing Linear Algebra - Frontend

This is the frontend component of the Racing Linear Algebra project. It is a web application built with React that provides the user interface for the game.

## Table of Contents

-   [Features](#features)
-   [Technologies Used](#technologies-used)
-   [Getting Started](#getting-started)

## Features

-   Engaging and interactive racing gameplay.
-   Real-time updates and synchronization with the server.
-   Responsive user interface optimized for laptop screen sizes.
-   Intuitive controls for easy gameplay.
-   Multiple difficulty levels of questions to choose from.
-   Support for answer input in multiple formats, including LaTeX.
-   Track simulation with train/boat that moves based on the player's score.
-   Ghost train simulation representing other teams for competitive gameplay.
-   Checkpoint leaderboard that displays when a certain score threshold is reached.
-   Final leaderboard at the end of each round to showcase the top teams.
-   Statistics screen displaying the questions answered by players with accuracy metrics.

## Technologies Used

-   React.js - JavaScript library for building user interfaces.
-   CSS - Styling and layout of the user interface.
-   WebSocket - Real-time communication with the backend server.
-   React Testing Library: Testing utilities for testing React components.
-   Jest: Testing framework for unit and integration testing.
-   React Router: Library for handling routing in a React application.
-   Axios: Promise-based HTTP client for making API requests.

## Getting Started

To get started with the frontend of Racing Linear Algebra, follow these steps:

### Prerequisites

-   Node.js (version 12 or higher)
-   npm (Node Package Manager)

### Installation

Follow these steps to get the game up and running on your local machine:

1. Clone the repository
2. Navigate to the project directory: `cd client`
3. Install the dependencies: `npm install`

### Usage

To start the game, run the following command: `npm start`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Tests

To run the tests, run the following command: `npm run test`.\
Press `a` to run all tests.

To see test coverage, run the following command: `npm run test:ci`

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
