'use client';

import React from 'react';
import HeroCarousel from './HeroCarousel';

interface HeroBannerProps {
  setIsAdminOpen?: (open: boolean) => void;
}

export default function HeroBanner({ setIsAdminOpen }: HeroBannerProps) {
  return (
    <div className="mb-6">
      <HeroCarousel />
    </div>
  );
}
