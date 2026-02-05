import React from 'react';

const EmailLink: React.FC = () => {
    return (
        <div className="hidden md:flex flex-col items-center fixed bottom-0 right-12 w-10 z-50">
            <a 
                href="mailto:joseph.valderrama@email.com" 
                className="p-2 writing-mode-vertical-rl text-text-muted hover:text-accent tracking-widest text-sm font-mono transform hover:-translate-y-1 transition-all duration-300 mb-4"
                style={{ writingMode: 'vertical-rl' }}
            >
                joseph.valderrama@email.com
            </a>
            <div className="w-px h-24 bg-text-muted"></div>
        </div>
    );
};

export default EmailLink;