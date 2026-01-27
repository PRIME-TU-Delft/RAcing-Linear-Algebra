import { useEffect, useState } from "react";
import BoatThemeSprites from "../../../Sprites/BoatThemeSprites";
import "./Seals.css";

interface Props {
    points: { top: number; left: number; flipped: boolean }[];
}

const GIF_DURATION = 5320;
const MAX_DELAY = 1500;
// Increased buffer to handle browser decode lag
const SAFETY_BUFFER = 2000; 

// --- 1. CHILD COMPONENT ---
const DelayedSeal = ({ src, delay, triggerId }: { src: string, delay: number, triggerId: number }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(false);
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]); // TriggerId is handled by the parent remounting logic

    if (!isVisible) {
        return <div style={{ width: '50px', height: '50px', opacity: 0 }} />;
    }

    return (
        <img
            // CRITICAL FIX:
            // Instead of modifying 'src', we use the 'key' prop.
            // When triggerId changes, React destroys this DOM node and makes a new one.
            // This forces the browser to restart the GIF from frame 0.
            key={triggerId} 
            src={src} 
            alt="Seal"
            className="seal-gif"
            style={{ 
                animation: "fadeIn 0.1s ease-out",
                willChange: "transform" // Performance hint
            }}
        />
    );
};

// --- 2. PARENT COMPONENT ---
function Seals({ points }: Props) {
    // Unified state to prevent render thrashing
    const [state, setState] = useState({
        pointIndex: 0,
        cycleId: 0,
        delays: generateDelays()
    });

    function generateDelays() {
        const maxSlot = Math.floor(Math.random() * 3);
        return [0, 1, 2].map(i => (i === maxSlot ? MAX_DELAY : Math.floor(Math.random() * MAX_DELAY)));
    }

    useEffect(() => {
        // Calculate dynamic time based on the actual generated delays
        const currentMaxDelay = Math.max(...state.delays);
        const dynamicCycleTime = currentMaxDelay + GIF_DURATION + SAFETY_BUFFER;

        const timer = setTimeout(() => {
            setState(prev => ({
                pointIndex: (prev.pointIndex + 1) % points.length,
                cycleId: prev.cycleId + 1,
                delays: generateDelays()
            }));
        }, dynamicCycleTime);

        return () => clearTimeout(timer);
    }, [state.cycleId, points.length]);

    const currentPoint = points[state.pointIndex];

    return (
        <div
            className="seal-pod-container"
            style={{
                top: `${currentPoint.top * 100}%`,
                left: `${currentPoint.left * 100}%`,
                transform: currentPoint.flipped ? "scaleX(-1)" : "scaleX(1)",
                transition: "top 0.5s ease, left 0.5s ease"
            }}
        >
            {/* Changing this key forces the children to fully reset/remount */}
            <div className="seal-container" key={state.cycleId}>
                {state.delays.map((delay, i) => (
                    <DelayedSeal
                        key={i}
                        src={BoatThemeSprites.seal}
                        delay={delay}
                        triggerId={state.cycleId}
                    />
                ))}
            </div>
        </div>
    );
}

export default Seals;