import { useEffect, useState } from "react";
import BoatThemeSprites from "../../../Sprites/BoatThemeSprites";
import "./DolphinPod.css";

interface Props {
    points: { top: number; left: number; flipped: boolean }[];
}

const GIF_DURATION = 3060;
const MAX_DELAY = 1500;
const SAFETY_BUFFER = 0; // Small buffer to ensure the last frame isn't clipped
const TOTAL_CYCLE_TIME = GIF_DURATION + MAX_DELAY + SAFETY_BUFFER;

// --- 1. CHILD COMPONENT ---
// Simple and dumb: It just waits for the 'delay' prop, then shows the GIF.
const DelayedDolphin = ({ src, delay }: { src: string, delay: number }) => {
    const [isVisible, setIsVisible] = useState(false);
    // Cache-bust ID to force GIF restart from frame 0
    const [uniqueId] = useState(() => Math.random().toString(36).substring(7));

    useEffect(() => {
        // Reset visibility if delay changes (sanity check)
        setIsVisible(false);
        
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    if (!isVisible) {
        return <div style={{ width: '50px', height: '50px', opacity: 0 }} />;
    }

    return (
        <img
            src={`${src}?v=${uniqueId}`}
            alt="Dolphin"
            className="dolphin-gif"
            // Optional fade in to soften the appearance
            style={{ animation: "fadeIn 0.1s ease-out" }}
        />
    );
};

// --- 2. PARENT COMPONENT ---
function DolphinPod({ points }: Props) {
    const [index, setIndex] = useState(0);
    const [cycleKey, setCycleKey] = useState(0);
    
    // Initialize delays: One is MAX, two are random
    const [delays, setDelays] = useState<number[]>(() => generateDelays());

    // Helper to ensure one dolphin always anchors the timeline
    function generateDelays() {
        // 1. Pick which slot (0, 1, or 2) gets the MAX delay
        const maxSlot = Math.floor(Math.random() * 3);
        
        // 2. Generate the array
        return [0, 1, 2].map(i => {
            if (i === maxSlot) return MAX_DELAY;
            // The others get a random delay between 0 and MAX
            return Math.floor(Math.random() * MAX_DELAY);
        });
    }

    useEffect(() => {
        // The cycle time is now FIXED and deterministic.
        // We don't need to calculate it based on random values.
        const timer = setTimeout(() => {
            // 1. Move Pod
            setIndex((prev) => (prev + 1) % points.length);
            
            // 2. Hard Reset Children
            setCycleKey((prev) => prev + 1);

            // 3. Calculate delays for the NEXT cycle
            setDelays(generateDelays());

        }, TOTAL_CYCLE_TIME);

        return () => clearTimeout(timer);
    }, [cycleKey, points.length]);

    return (
        <div
            className="dolphin-pod-container"
            style={{
                top: `${points[index].top * 100}%`,
                left: `${points[index].left * 100}%`,
                transform: points[index].flipped ? "scaleX(-1)" : "scaleX(1)"
            }}
        >
            {/* Key update forces full DOM destruction/recreation */}
            <div className="dolphin-container" key={cycleKey}>
                {delays.map((delay, i) => (
                    <DelayedDolphin
                        key={i} // Simple index key is fine because parent div resets
                        src={BoatThemeSprites.dolphin}
                        delay={delay}
                    />
                ))}
            </div>
        </div>
    );
}

export default DolphinPod;