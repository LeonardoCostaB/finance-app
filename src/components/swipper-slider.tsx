'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

interface SwiperCustomSlide {
   slides: Array<{ id: string; children: any }>;
   classNames: string | undefined;
}

export function SwiperCustomSlide({ slides, classNames }: SwiperCustomSlide) {
   return (
      <Swiper
         className={classNames}
         modules={[Autoplay]}
         breakpoints={{
            300: {
               slidesPerView: 1,
            },
            405: {
               slidesPerView: 2,
               spaceBetween: 8,
            },
            580: {
               slidesPerView: 3,
               spaceBetween: 8,
            },
            680: {
               slidesPerView: 4,
               spaceBetween: 8,
            },
            800: {
               slidesPerView: 5,
               spaceBetween: 8,
            },
            1024: {
               slidesPerView: 4,
               spaceBetween: 8,
            },
            1280: {
               slidesPerView: 5,
               spaceBetween: 16,
            },
         }}
         loop={slides.length > 4}
         autoplay={{
            delay: 0,
            pauseOnMouseEnter: true,
         }}
         speed={2000}
      >
         {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="!flex first:pl-1">
               {slide.children}
            </SwiperSlide>
         ))}
      </Swiper>
   );
}
