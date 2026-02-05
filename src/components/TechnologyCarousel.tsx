import React, { useRef, useState, useEffect, useCallback } from 'react';

interface Technology {
    name: string;
    icon: React.ReactElement;
}

interface TechnologyCarouselProps {
    technologies: Technology[];
}

const TechnologyCarousel: React.FC<TechnologyCarouselProps> = ({ technologies }) => {
    const isCarousel = technologies.length > 4;
    
    // Carousel logic
    const extendedTechnologies = isCarousel ? [...technologies, ...technologies] : [];
    const carouselRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const positionRef = useRef(0);
    const lastTimeRef = useRef(0);
    const velocity = 0.03; // pixels per millisecond

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startPosition, setStartPosition] = useState(0);

    const animate = useCallback((time: number) => {
        if (lastTimeRef.current) {
            const deltaTime = time - lastTimeRef.current;
            positionRef.current -= velocity * deltaTime;
        }
        lastTimeRef.current = time;

        if (carouselRef.current) {
            const carouselWidth = carouselRef.current.scrollWidth / 2;
            if (positionRef.current <= -carouselWidth) {
                positionRef.current += carouselWidth;
            }
            carouselRef.current.style.transform = `translateX(${positionRef.current}px)`;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
    }, []);
    
    const stopAnimation = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
            lastTimeRef.current = 0;
        }
    }, []);

    const startAnimation = useCallback(() => {
        if (animationFrameRef.current || isDragging) return;
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [animate, isDragging]);

    useEffect(() => {
        if (!isCarousel) return;
        const timeoutId = setTimeout(startAnimation, 100);
        return () => {
            clearTimeout(timeoutId);
            stopAnimation();
        };
    }, [isCarousel, startAnimation, stopAnimation]);

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isCarousel) return;
        stopAnimation();
        setIsDragging(true);
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        setStartX(pageX);
        setStartPosition(positionRef.current);
        if (carouselRef.current) {
            carouselRef.current.style.cursor = 'grabbing';
            carouselRef.current.style.userSelect = 'none';
        }
    };
    
    const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isCarousel || !isDragging || !carouselRef.current) return;
        e.preventDefault();
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        const walk = pageX - startX;
        positionRef.current = startPosition + walk;

        const carouselWidth = carouselRef.current.scrollWidth / 2;
         if (positionRef.current > 0) {
            positionRef.current -= carouselWidth;
            setStartPosition(startPosition - carouselWidth);
        } else if (positionRef.current < -carouselWidth) {
            positionRef.current += carouselWidth;
            setStartPosition(startPosition + carouselWidth);
        }
        
        carouselRef.current.style.transform = `translateX(${positionRef.current}px)`;
    };

    const handleDragEnd = () => {
        if (!isCarousel || !isDragging) return;
        setIsDragging(false);

        if(carouselRef.current) {
            carouselRef.current.style.cursor = 'grab';
            carouselRef.current.style.userSelect = 'auto';
        }
        startAnimation();
    };
    
    const handleMouseLeave = () => {
        if (isDragging) {
            handleDragEnd();
        }
        if (isCarousel) {
            startAnimation();
        }
    };

    return (
        <div 
            className={`relative group flex items-center ${isCarousel ? 'w-full overflow-hidden cursor-grab justify-start' : 'flex-wrap gap-x-8 gap-y-4 justify-center'}`}
            onMouseEnter={isCarousel ? stopAnimation : undefined}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
        >
            {isCarousel ? (
                <>
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none group-hover:opacity-50 transition-opacity"></div>
                    <div className="flex" ref={carouselRef}>
                        {extendedTechnologies.map((tech, index) => (
                            <div key={`${tech.name}-${index}`} className="flex-shrink-0 w-40 flex flex-col items-center justify-center p-4 text-center space-y-2 transform transition-transform duration-200 hover:scale-105" title={tech.name}>
                                {tech.icon}
                                <span className="text-sm text-text-muted font-medium">{tech.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none group-hover:opacity-50 transition-opacity"></div>
                </>
            ) : (
                technologies.map((tech, index) => (
                    <div key={`${tech.name}-${index}`} className="w-40 flex flex-col items-center justify-center p-4 text-center space-y-2 transform hover:-translate-y-1 transition-transform duration-200" title={tech.name}>
                        {tech.icon}
                        <span className="text-sm text-text-muted font-medium">{tech.name}</span>
                    </div>
                ))
            )}
        </div>
    );
};

export default TechnologyCarousel;