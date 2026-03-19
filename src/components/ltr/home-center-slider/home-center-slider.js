"use client";

import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import { useEffect, useRef, useState } from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import 'animate.css/animate.css'
import { useLanguage } from '@/lib/LanguageContext';

const dictionary = {
  en: {
    news: 'News',
    editor: 'Editor',
    by: 'By',
    loading: 'Loading...'
  },
  bn: {
    news: 'সংবাদ',
    editor: 'সম্পাদক',
    by: 'লিখেছেন:',
    loading: 'লোড হচ্ছে...'
  }
};
const optionEight = {
    loop: true,
    items: 1,
    dots: true,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    nav: true,
    navText: [
      `<i class='ti ti-angle-left'></i>`,
      `<i class='ti ti-angle-right'></i>`
    ]
};

const HomeCenterSlider = ({ data = [], isLoading = false }) => {
  const { locale } = useLanguage();
  const t = dictionary[locale] || dictionary.bn;
  const dateLocale = locale === 'en' ? 'en-US' : 'bn-BD';
  const sliderRef = useRef(null);
  const [enableCarousel, setEnableCarousel] = useState(false);
  const [OwlCarouselComponent, setOwlCarouselComponent] = useState(null);

  // Use data from props (which handles dummy data from parent)
  const items = data.slice(0, 5);

  useEffect(() => {
    let observer;
    let timeoutId;
    let idleId;

    const activateCarousel = () => {
      setEnableCarousel(true);
    };

    const scheduleActivation = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => activateCarousel(), { timeout: 1500 });
      } else {
        timeoutId = window.setTimeout(() => activateCarousel(), 500);
      }
    };

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && sliderRef.current) {
      observer = new window.IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            scheduleActivation();
            observer.disconnect();
          }
        },
        { rootMargin: '200px 0px' }
      );
      observer.observe(sliderRef.current);
    } else {
      scheduleActivation();
    }

    return () => {
      if (observer) observer.disconnect();
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  useEffect(() => {
    if (!enableCarousel || typeof window === 'undefined') return;

    let isMounted = true;

    const loadCarousel = async () => {
      if (!window.jQuery) {
        const jqueryModule = await import('jquery');
        const jquery = jqueryModule.default || jqueryModule;
        window.$ = window.jQuery = jquery;
      }

      const carouselModule = await import('react-owl-carousel');
      if (isMounted) {
        setOwlCarouselComponent(() => carouselModule.default || carouselModule);
      }
    };

    loadCarousel();

    return () => {
      isMounted = false;
    };
  }, [enableCarousel]);

  if (!isLoading && items.length === 0) return null;

  const renderSlide = (article, index, asCarouselItem = true) => {
    const articleData = article.attributes || article;
    const imageUrl = getStrapiMedia(articleData.cover);
    const category = articleData.category?.name || articleData.category?.data?.attributes?.name || t.news;
    const slug = articleData.slug || '#';
    const title = articleData.title || t.loading;
    const authorName = articleData.author?.name || articleData.author?.data?.attributes?.name || t.editor;
    const date = new Date(articleData.createdAt || articleData.publishedAt).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' });

    const slide = (
      <div className="slider-post post-height-1">
        <Link href={isLoading ? '#' : `/article/${slug}`} className="news-image">
          <img
            src={imageUrl}
            alt={title}
            className="img-fluid"
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            onError={(e) => e.target.src = '/default.jpg'}
          />
        </Link>
        <div className="post-text">
          <span className="post-category">{category}</span>
          <h4 className="mb-2">
            <Link href={isLoading ? '#' : `/article/${slug}`}>{title}</Link>
          </h4>
          <ul className="align-items-center authar-info d-flex flex-wrap">
            <li className="post-atuthor-list">
              <div className="post-atuthor">
                <span>
                  <Link href="#">{authorName}</Link>
                </span>
              </div>
            </li>
            <li className="post-date">{date}</li>
          </ul>
        </div>
      </div>
    );

    if (!asCarouselItem) return slide;

    return (
      <div className="item" key={article.id || index}>
        {slide}
      </div>
    );
  };

  return (
    <div ref={sliderRef}>
      {enableCarousel && OwlCarouselComponent ? (
        <OwlCarouselComponent key={isLoading ? 'loading' : 'loaded'} id="owl-slider" className="owl-theme home-hero-slider" {...optionEight}>
          {items.map((article, index) => renderSlide(article, index, true))}
        </OwlCarouselComponent>
      ) : (
        <div id="owl-slider" className="owl-theme home-hero-slider home-hero-slider-fallback">
          {renderSlide(items[0], 0, false)}
        </div>
      )}
    </div>
  );
};



export default HomeCenterSlider;