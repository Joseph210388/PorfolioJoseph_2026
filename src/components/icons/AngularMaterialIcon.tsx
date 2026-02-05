import React from 'react';

const AngularMaterialIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5L12 2z" fill="#00BCD4"/>
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91" fill="#0097A7"/>
        <path d="M12 12l4 2-4 2v-4zM8 12l4-2v4l-4-2z" fill="#fff"/>
        <path d="M12 7l-4 5 4 5 4-5-4-5z" fill="#fff" fillOpacity="0.7"/>
    </svg>
);

export default AngularMaterialIcon;
