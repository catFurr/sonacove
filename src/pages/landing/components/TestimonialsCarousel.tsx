// src/components/TestimonialsCarousel.tsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import TestimonialCard from './TestimonialCard';
import type { Testimonial } from './types';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
}) => {
  return (
    <div>
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true, type: 'fraction' }}
        className='pb-14'
        autoHeight={true}
        navigation={true}
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index} className='h-full'>
            <TestimonialCard index={index} testimonial={testimonial} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialsCarousel;
