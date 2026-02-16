"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import { getTrendingCategories } from "@/services/globalService";
import Skeleton from "@/components/skeleton";
import { useLanguage } from "@/context/LanguageContext";

const TrendingTopics = ({ initialCategories = [] }) => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(!initialCategories.length);
  const locale = language === 'bn' ? 'bn' : 'en';

  const t = {
    bn: {
      titleStrong: 'ট্রেন্ডিং',
      titleRest: 'টপিকস',
      viewAll: 'সব ক্যাটাগরি দেখুন',
      categoryFallback: 'ক্যাটাগরি'
    },
    en: {
      titleStrong: 'Trending',
      titleRest: 'topics',
      viewAll: 'View all categories',
      categoryFallback: 'Category'
    }
  };

  const currentT = t[language] || t.bn;

  // Use a ref to track if we've already attempted to fetch for the current language
  // This prevents infinite loops if initialCategories is unstable
  const fetchedRef = useState(false);

  useEffect(() => {
    // If we have categories (from props or previous fetch), don't fetch.
    if (categories.length > 0) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const response = await getTrendingCategories(5, locale);
        setCategories(response?.data || []);
      } catch (error) {
        console.error("Error fetching trending topics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [language]); // Depend only on language, not on the initialCategories prop array

  if (loading) {
     return (
        <div className="panel_inner review-inner">
          <div className="panel_header">
            <h4>
              <strong>{currentT.titleStrong}</strong> {currentT.titleRest}
            </h4>
          </div>
          <div className="panel_body">
             {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="mb-2 w-100" style={{ height: '60px' }} />
             ))}
             <div className="text-center mt-3">
                <Skeleton style={{ width: '120px', height: '20px', margin: '0 auto' }} />
             </div>
          </div>
        </div>
     );
  }

  if (!categories.length) {
    return (
        <div className="panel_inner review-inner">
          <div className="panel_header">
            <h4>
              <strong>{currentT.titleStrong}</strong> {currentT.titleRest}
            </h4>
          </div>
          <div className="panel_body">
            <div className="p-3 text-center text-muted">
                {language === 'bn' ? 'কোনো ট্রেন্ডিং টপিক নেই' : 'No trending topics found'}
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="panel_inner review-inner">
      <div className="panel_header">
        <h4>
          <strong>{currentT.titleStrong}</strong> {currentT.titleRest}
        </h4>
      </div>
      <div className="panel_body">
        {categories.map((category) => {
          // Support both Strapi 4 (attributes wrapper) and Strapi 5 (flat) structure
          const cat = category.attributes || category;
          return (
            <div
              key={category.id}
              className="text-center mb-2 card-bg-scale position-relative overflow-hidden bg-dark-overlay bg-img p-3"
              style={{
                backgroundImage: getStrapiMedia(cat.featuredImage) ? `url(${getStrapiMedia(cat.featuredImage)})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Link
                href={`/${language}/category/${cat.slug || '#'}`}
                className="btn-link fs-5 fw-bold stretched-link text-decoration-none text-white"
              >
                {cat.name || currentT.categoryFallback}
              </Link>
            </div>
          );
        })}
        
        <div className="text-center mt-3">
          <Link href={`/${language}/categories`} className="fw-bold text-primary-hover text-decoration-underline">
            {currentT.viewAll}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrendingTopics;
