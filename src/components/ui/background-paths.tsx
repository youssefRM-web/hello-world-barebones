"use client";

import { motion } from "framer-motion";

const blueShades = [
    "#020617", // slate-950
    "#0f172a", // slate-900
    "#1e293b", // slate-800
    "#172554", // blue-950
    "#1e3a8a", // blue-900
    "#1d4ed8", // blue-700
];

export function FloatingPaths({ position }: { position: number }) {
    const count = 18;
    const half = (count - 1) / 2;
    
    const paths = Array.from({ length: count }, (_, i) => {
        const spread = i - half;
        const endX = 1200 + spread * 50;
        const endY = 800 + spread * 30;
        
        return {
            id: i,
            d: `M-${380 - i * 10 * position} -${189 + i * 12}Q${
                -312 - i * 10 * position
            } ${216 - i * 12} ${152 - i * 10 * position} ${343 - i * 12}T${
                endX
            } ${endY}`,
            color: blueShades[i % blueShades.length],
            width: 0.15 + i * 0.01,
        };
    });

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke={path.color}
                        strokeWidth={path.width}
                        strokeOpacity={0.3 + (path.id % 6) * 0.1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 15 + path.id,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}
