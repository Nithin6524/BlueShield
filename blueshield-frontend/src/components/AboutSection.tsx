'use client';

import React, { useEffect, useRef } from 'react';
import RealOceanMap from '@/components/RealOceanMap';
import { ABOUT_CONTENT, OCEAN_POLLUTION_DATA, HEALTH_IMPACT_STATS } from '@/constants/data';

const AboutSection: React.FC = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
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

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={aboutRef} className="pt-20 pb-1 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* About Content */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Text Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                {ABOUT_CONTENT.title}
              </h2>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                {ABOUT_CONTENT.description}
              </p>
              
              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {ABOUT_CONTENT.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-ocean-primary rounded-full"></div>
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
              
              
            </div>

            {/* Real Interactive Map */}
            <div className="relative">
              <RealOceanMap />
            </div>
          </div>

          {/* Ocean Pollution Statistics */}
          <div id="ocean-pollution-impact" className="mb-20">
            <h3 className="text-3xl font-bold text-center text-text-primary mb-12">
              Ocean Pollution Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {OCEAN_POLLUTION_DATA.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-ocean-surface rounded-xl"
                >
                  <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-text-primary mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human Health Impact Statistics */}
          <div id="human-health-impact" className="mb-20">
            <h3 className="text-3xl font-bold text-center text-text-primary mb-12">
              Human Health Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HEALTH_IMPACT_STATS.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-gradient-to-br from-coral/10 to-ocean-primary/10 rounded-xl border border-coral/20"
                >
                  <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-text-primary mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-lg text-text-secondary max-w-4xl mx-auto leading-relaxed">
                The consumption of contaminated seafood exposes humans to microplastics and associated toxins, 
                potentially leading to health issues including inflammation, endocrine disruption, and increased 
                risk of chronic diseases. Our platform helps assess these risks and provides personalized 
                recommendations for safer seafood consumption.
              </p>
            </div>
          </div>

         
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
