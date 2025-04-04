import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import socket from "../../../../socket";
import "./QuestionStatistics.css";
import { Divider } from "@mui/material";

interface Statistic {
  question: {
    _id: string;
    exerciseId: number;
    url: string;
    difficulty: string;
    numOfAttempts: number;
    name: string;
    __v: number;
  };
  correctlyAnswered: number;
  incorrectlyAnswered: number;
}

interface Props {
  onContinue: () => void;
}

function QuestionStatistics(props: Props) {
  const [statistics, setStatistics] = useState<Statistic[]>([]);

  useEffect(() => {
    socket.on("statistics", (data: string) => {
      const parsedStatistics: Statistic[] = JSON.parse(data);
      setStatistics(parsedStatistics);
    });
    return () => {
      socket.off("statistics");
    };
  }, []);

  const calculateAccuracy = (stat: Statistic) => {
    const total = stat.correctlyAnswered + stat.incorrectlyAnswered;
    if (total === 0) return "0.00";
    return ((stat.correctlyAnswered / total) * 100).toFixed(2);
  };

  return (
    <div>
      <div className="statistics-header">
        <div className="question-statistics-title">
            Question Statistics
        </div>
        <div className="question-statistics-continue" onClick={() => props.onContinue()}>
            Continue
        </div>
      </div>
      
      {statistics.map((stat, index) => (
        <div key={stat.question._id} className="question-statistics-item">
            <Accordion sx={{ mb: 1, boxShadow: 2 }}>
              <AccordionSummary  aria-controls={`panel${index}-content`} id={`panel${index}-header`}>
                <div className="exercise-name">
                  <Typography variant="h6" component="div" className="exercise-name-text">
                    {stat.question.name}
                  </Typography>
                </div>

                <div className="stats-item d-flex justify-content-center align-items-center">
                    <strong>Difficulty:</strong>
                    <div className="stats-item-value">
                      {stat.question.difficulty.charAt(0).toUpperCase() + stat.question.difficulty.slice(1)}
                    </div>
                </div>

                <div className="stats-item d-flex justify-content-center align-items-center">
                    <strong>Accuracy:</strong>
                    <div className="stats-item-value">
                      {calculateAccuracy(stat)}%
                    </div>
                </div>

                <div className="stats-item d-flex justify-content-center align-items-center">
                    <strong>Wrong Attempts:</strong>
                    <div className="stats-item-value">
                      {stat.incorrectlyAnswered}
                    </div>
                </div>

                {/* <Grid container spacing={1} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Difficulty:</strong> {" "}
                      {stat.question.difficulty.charAt(0).toUpperCase() + stat.question.difficulty.slice(1)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Accuracy:</strong> {" "}
                      {calculateAccuracy(stat)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Wrong Attempts:</strong> {" "}
                      {stat.incorrectlyAnswered}
                    </Typography>
                  </Grid>
                </Grid> */}
              </AccordionSummary>
              <AccordionDetails>
              <Divider />
                <Box sx={{ width: "100%", height: "600px" }}>
                  <iframe
                    src={stat.question.url}
                    title={`Question ${index + 1}`}
                    width="60%"
                    height="100%"
                    frameBorder="0"
                    allow="fullscreen"
                  ></iframe>
                </Box>
              </AccordionDetails>
            </Accordion>
        </div>
      ))}
    </div>
  );
}

export default QuestionStatistics;