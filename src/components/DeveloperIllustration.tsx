
import React from 'react';

const DeveloperIllustration: React.FC = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
            <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F84B6C" stopOpacity={1} />
                <stop offset="100%" stopColor="#EC4869" stopOpacity={1} />
            </linearGradient>
        </defs>
        
        {/* Person */}
        <g transform="translate(100, 115)">
            {/* Body */}
            <path d="M-30 0 C-30 -40, 30 -40, 30 0 L 20 -50 L -20 -50 Z" fill="url(#shirtGradient)" />
            
            {/* Head */}
            <circle cx="0" cy="-65" r="20" fill="#2D3748" />
            <path d="M-15 -75 Q0 -85, 15 -75 C 20 -60, -20 -60, -15 -75" fill="#1A202C" />
            
            {/* Legs */}
            <path d="M-30 0 C-50 30, -30 60, 0 50" stroke="#1A202C" strokeWidth="15" fill="none" strokeLinecap="round" />
            <path d="M30 0 C50 30, 30 60, 0 50" stroke="#1A202C" strokeWidth="15" fill="none" strokeLinecap="round" />
        </g>
        
        {/* Laptop */}
        <g transform="translate(100, 120) rotate(-5)">
            <rect x="-45" y="-30" width="90" height="55" rx="5" ry="5" fill="#2D3748" />
            <rect x="-50" y="-35" width="100" height="5" rx="2" ry="2" fill="#4A5568" />
            <rect x="-40" y="-25" width="80" height="45" fill="#1A202C" />
            <text x="-5" y="-5" fontFamily="monospace" fontSize="8" fill="#A0AEC0">
                acer
            </text>
        </g>
    </svg>
);

export default DeveloperIllustration;