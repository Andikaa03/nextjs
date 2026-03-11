// Translations for the application
// Locale codes: 'bn' for Bengali (Bangladesh), 'en' for English

export const translations = {
  bn: {
    // Breadcrumbs
    home: 'হোম',
    
    // Article Details
    by: 'লিখেছেন:',
    editor: 'সম্পাদক',
    views: 'ভিউ',
    shareThisPost: 'এই পোস্টটি শেয়ার করুন',
    tags: 'ট্যাগ',
    relatedArticles: 'সম্পর্কিত নিবন্ধ',
    morePopularPosts: 'আরো জনপ্রিয় পোস্ট',
    
    // Sidebar
    joinFollowers: 'যোগ দিন',
    followers: 'ফলোয়ার',
    subscribers: 'সাবস্ক্রাইবার',
    fans: 'ফ্যান',
    mostViewed: 'সর্বাধিক পঠিত',
    popular: 'জনপ্রিয় খবর',
    
    // Comments Section
    comments: 'মন্তব্য',
    reply: 'জবাব',
    leaveAComment: 'একটি মন্তব্য লিখুন',
    fullName: 'সম্পূর্ণ নাম',
    email: 'ইমেইল',
    website: 'ওয়েবসাইট',
    subject: 'বিষয়',
    message: 'বার্তা',
    submit: 'জমা দিন',
    
    // Form Placeholders
    yourName: 'আপনার নাম*',
    yourEmailAddress: 'আপনার ইমেইল ঠিকানা এখানে লিখুন',
    yourWebsiteUrl: 'আপনার ওয়েবসাইট URL',
    writeSubjectHere: 'এখানে বিষয় লিখুন',
    yourComment: 'আপনার মন্তব্য*',
    
    // Reply Messages
    replyingTo: 'উত্তর দিচ্ছেন',
    cancel: 'বাতিল',
    
    // Load More
    loadMoreComments: 'আরও মন্তব্য লোড করুন',
    
    // Comment Meta
    anonymous: 'বেনামী',
    
    // Header/Footer (if needed)
    contact: 'যোগাযোগ',
    donation: 'দান',
    currency: 'মুদ্রা',
    wishlist: 'উইশলিস্ট',
    signUp: 'সাইন আপ',
    or: 'অথবা',
    login: 'লগইন',
    
    // Navigation
    home: 'হোম',
    megaMenu: 'মেগা মেনু',
    video: 'ভিডিও',
    pages: 'পেজ',
    aboutUs: 'আমাদের সম্পর্কে',
    typography: 'টাইপোগ্রাফি',
    faq: 'FAQ',
  },
  
  en: {
    // Breadcrumbs
    home: 'Home',
    
    // Article Details
    by: 'by',
    editor: 'Editor',
    views: 'views',
    shareThisPost: 'Share this post',
    tags: 'Tags',
    relatedArticles: 'Related Articles',
    morePopularPosts: 'More Popular Posts',
    
    // Sidebar
    joinFollowers: 'Join',
    followers: 'Followers',
    subscribers: 'Subscribers',
    fans: 'Fans',
    mostViewed: 'Most Viewed',
    popular: 'Popular News',
    
    // Comments Section
    comments: 'Comments',
    reply: 'Reply',
    leaveAComment: 'Leave a Comment',
    fullName: 'Full Name',
    email: 'Email',
    website: 'Website',
    subject: 'Subject',
    message: 'Message',
    submit: 'Submit',
    
    // Form Placeholders
    yourName: 'Your name*',
    yourEmailAddress: 'Your email address here',
    yourWebsiteUrl: 'Your website url',
    writeSubjectHere: 'Write subject here',
    yourComment: 'Your Comment*',
    
    // Reply Messages
    replyingTo: 'Replying to',
    cancel: 'Cancel',
    
    // Load More
    loadMoreComments: 'Load More Comments',
    
    // Comment Meta
    anonymous: 'Anonymous',
    
    // Header/Footer (if needed)
    contact: 'Contact',
    donation: 'Donation',
    currency: 'Currency',
    wishlist: 'Wishlist',
    signUp: 'Sign Up',
    or: 'or',
    login: 'Login',
    
    // Navigation
   home: 'Home',
    megaMenu: 'Mega Menu',
    video: 'Video',
    pages: 'Pages',
    aboutUs: 'About Us',
    typography: 'Typography',
    faq: 'FAQ',
  }
};

// Helper function to get translation
export const t = (key, locale = 'bn') => {
  return translations[locale]?.[key] || translations['en']?.[key] || key;
};

// Hook for use in components
import { useMemo } from 'react';

export const useTranslations = (locale = 'bn') => {
  return useMemo(() => {
    return {
      t: (key) => t(key, locale),
      locale
    };
  }, [locale]);
};
