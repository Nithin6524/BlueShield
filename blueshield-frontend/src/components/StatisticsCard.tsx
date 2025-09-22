'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StatisticsCardProps {
  number: string;
  label: string;
  description: string;
  color: string;
  delay?: number;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  number,
  label,
  description,
  color,
  delay = 0
}) => {
  const numberRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (numberRef.current) {
      observer.observe(numberRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={numberRef}
      className={cn(
        "text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-700 transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <div className={cn("text-4xl font-bold mb-2", color)}>
        {number}
      </div>
      <div className="text-lg font-semibold text-gray-300 mb-1">
        {label}
      </div>
      <div className="text-sm text-gray-400">
        {description}
      </div>
    </div>
  );
};

export default StatisticsCard;
