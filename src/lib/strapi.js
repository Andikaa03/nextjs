const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://app.shottyodharaprotidin.com';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
const DEFAULT_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 8000);

/**
 * Helper to make requests to Strapi API
 */
export async function fetchAPI(path, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization if token is available
  if (API_TOKEN) {
    defaultOptions.headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  const { silent, timeoutMs = DEFAULT_TIMEOUT_MS, signal: externalSignal, ...fetchOptions } = options;
  const timeoutController = externalSignal ? null : new AbortController();
  const signal = externalSignal || timeoutController?.signal;
  const timeoutId = timeoutController
    ? setTimeout(() => timeoutController.abort(), timeoutMs)
    : null;

  const mergedOptions = {
    ...defaultOptions,
    ...fetchOptions,
    signal,
  };

  const requestUrl = `${STRAPI_URL}/api${path}`;
  
  try {
    const response = await fetch(requestUrl, mergedOptions);
    
    if (!response.ok) {
      if (!silent) {
        console.error(`Strapi API Error: ${response.status} ${response.statusText}`);
      }
      const error = new Error(`Failed to fetch from Strapi: ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.url = requestUrl;
      throw error;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error(`Strapi request timeout after ${timeoutMs}ms`);
      timeoutError.status = 408;
      timeoutError.statusText = 'Request Timeout';
      timeoutError.url = requestUrl;
      if (!silent) {
        console.error('Strapi fetch timeout:', timeoutError);
      }
      throw timeoutError;
    }

    if (!silent) {
      console.error('Strapi fetch error:', error);
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Helper to get image URL from Strapi media
 * Supports both Strapi 4 (with .data.attributes) and Strapi 5 (flat structure)
 */
export function getStrapiMedia(media, fallback = '/default.jpg') {
  if (!media) return fallback;
  
  // Strapi 5 flat structure
  if (media.url) {
    return media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`;
  }
  
  // Strapi 4 structure with data wrapper
  if (media.data?.attributes?.url) {
    const { url } = media.data.attributes;
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  }
  
  return fallback;
}

// Helper to convert English digits to Bengali
export const toBengaliNumber = (num) => {
  if (num === null || num === undefined) return '';
  const englishToBengali = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(num).replace(/[0-9]/g, (digit) => englishToBengali[digit] || digit);
};

export function getStrapiLocale(locale) {
  const mapping = {
    'bn': 'bn-BD',
    'en': 'en'
  };
  return mapping[locale] || locale;
}

/**
 * Format Strapi date to readable format
 * Supports 'bn' (Bengali) and 'en' (English)
 */
export function formatDate(dateString, localeArg) {
  const date = new Date(dateString);
  const locale = localeArg || 'bn'; 
  
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (locale === 'en') {
    return date.toLocaleDateString('en-US', options);
  }

  // Bengali locale
  const formattedGregorian = date.toLocaleDateString('bn-BD', options);
  const gregorianParts = formattedGregorian.split(', ');
  const weekday = gregorianParts.length > 1 ? gregorianParts[0] : '';
  const datePart = gregorianParts.length > 1 ? gregorianParts.slice(1).join(' ') : formattedGregorian;
  
  // Convert to Bengali Date
  try {
    const { BanglaDateConverter } = require('bangla-date-converter');
    // Ensure accurate offset handling by creating a new date locally
    // to match Bangladesh time just in case.
    const converter = new BanglaDateConverter(date);
    const banglaDate = converter.format('DD MMMM YYYY').replace(',', '');
    
    // Day name, english calendar, bangla calendar
    const finalDateStr = `${weekday}, ${datePart}, ${banglaDate}`;
    return toBengaliNumber(finalDateStr);
  } catch (err) {
    console.error('Error formatting bangla date:', err);
    return toBengaliNumber(formattedGregorian);
  }
}
