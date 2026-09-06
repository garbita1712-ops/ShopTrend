'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const bannerSlides = [
  {
    id: 1,
    image: '/images/banners/banner1.jpg',
    title: 'Curated Everyday Essentials',
    subtitle: 'Minimalist tech and lifestyle accessories',
  },
  {
    id: 2,
    image: '/images/banners/banner2.jpg',
    title: 'Premium Audio Systems',
    subtitle: 'Noise-canceling headphones & high-fidelity sound',
  },
  {
    id: 3,
    image: '/images/banners/banner3.jpg',
    title: 'Precision Accessories',
    subtitle: 'Designed for modern workflow & daily living',
  },
];

export default function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: false }),
  ]);

  return (
    <div className="w-full overflow-hidden rounded border border-slate-200 bg-slate-100" ref={emblaRef}>
      <div className="flex">
        {bannerSlides.map((slide) => (
          <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative aspect-[21/9] md:aspect-[28/9]">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent flex flex-col justify-end p-6 md:p-8">
              <h2 className="text-white text-lg md:text-2xl font-bold tracking-tight">{slide.title}</h2>
              <p className="text-slate-200 text-xs md:text-sm mt-0.5">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
