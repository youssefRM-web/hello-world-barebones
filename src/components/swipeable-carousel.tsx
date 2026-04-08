import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface SwipeableCarouselProps {
  children: React.ReactNode[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function SwipeableCarousel({ 
  children, 
  className = '',
  autoPlay = false,
  autoPlayInterval = 5000
}: SwipeableCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (info.offset.x < 0 && currentIndex < children.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % children.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
  };

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, currentIndex]);

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      <motion.div
        className="flex"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: isDragging ? 0 : 0.5
        }}
      >
        {children.map((child, index) => (
          <div key={index} className="flex-shrink-0 w-full">
            {child}
          </div>
        ))}
      </motion.div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-4 space-x-2" role="tablist" aria-label="Carousel navigation">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Folie ${index + 1} von ${children.length}`}
            aria-selected={index === currentIndex}
            role="tab"
            className="p-2 flex items-center justify-center"
          >
            <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-blue-500 scale-125' 
                : 'bg-gray-400 hover:bg-gray-300'
            }`} />
          </button>
        ))}
      </div>

      {/* Navigation Arrows (Hidden on mobile, visible on desktop) */}
      <button
        onClick={prevSlide}
        aria-label="Vorherige Folie"
        className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
      >
        <span aria-hidden="true">←</span>
      </button>
      
      <button
        onClick={nextSlide}
        aria-label="Nächste Folie"
        className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}