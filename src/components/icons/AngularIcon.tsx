import React from 'react';

const AngularIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" className={className}>
        <polygon fill="#DD0031" points="125,30 125,30 125,30 31.9,63.2 46.1,186.3 125,230 125,230 203.9,186.3 218.1,63.2"></polygon>
        <polygon fill="#C3002F" points="125,30 125,52.2 125,52.1 125,153.4 125,153.4 125,230 125,230 203.9,186.3 218.1,63.2 125,30"></polygon>
        <path fill="#FFFFFF" d="M125,52.1L66.8,182.6h21.7l11.7-29.2h49.4l11.7,29.2h21.7L125,52.1z M142,135.4H108.1l16.9-42.2L142,135.4z"></path>
    </svg>
);

export default AngularIcon;
