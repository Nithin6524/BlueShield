'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import StatisticsCard from '@/components/StatisticsCard';
import { HERO_CONTENT, MARINE_IMPACT_STATS } from '@/constants/data';

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ocean-gradient"
    >
     

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
           <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold text-white my-8 leading-tight">
             {HERO_CONTENT.title}
           </h1>
           
           <p className="text-xl md:text-2xl text-white font-semibold mb-4">
             {HERO_CONTENT.subtitle}
           </p>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            {HERO_CONTENT.description}
          </p>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {MARINE_IMPACT_STATS.map((stat, index) => (
              <StatisticsCard
                key={index}
                number={stat.number}
                label={stat.label}
                description={stat.description}
                color={stat.color}
                delay={index * 200}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-ocean-secondary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-ocean-secondary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
