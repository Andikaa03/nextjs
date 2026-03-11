import '@fortawesome/fontawesome-free/css/all.min.css';
import "@icon/themify-icons/themify-icons.css"
import './globals.css'

import ImportJs from '@/components/ltr/import-js/import-js';
import Providers from './theme-providers';
import { getGlobalSettings } from '@/services/globalService';
import { getStrapiMedia } from '@/lib/strapi';

export async function generateMetadata() {
  try {
    const globalRes = await getGlobalSettings('bn');
    // Strapi v5 flat structure: fields are directly on data, no .attributes wrapper
    const attrs = globalRes?.data?.attributes || globalRes?.data || {};
    const seo = attrs.defaultSeo || {};
    
    const faviconUrl = getStrapiMedia(attrs.favicon, null);

    const defaultIcons = {
      icon: [
        { url: '/favicon.ico?v=5' },
        { url: '/favicon-16x16.png?v=5', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png?v=5', sizes: '32x32', type: 'image/png' },
      ],
      apple: ['/apple-touch-icon.png?v=5'],
      shortcut: ['/favicon.ico?v=5']
    };

    const metaImage = getStrapiMedia(seo.metaImage || seo.shareImage);

    return {
      title: seo.metaTitle || attrs.siteName || 'Satyadhara Pratidin',
      description: seo.metaDescription || attrs.siteDescription || 'সত্যধারা প্রতিদিন - সত্যের সন্ধানে সর্বদা',
      keywords: seo.keywords || 'news, portal, bangladesh, update',
      icons: faviconUrl ? {
        icon: [{ url: faviconUrl }],
        shortcut: [faviconUrl],
        apple: [faviconUrl]
      } : defaultIcons,
      openGraph: {
        title: seo.metaTitle || attrs.siteName || 'Satyadhara Pratidin',
        description: seo.metaDescription || attrs.siteDescription || 'সত্যধারা প্রতিদিন - সত্যের সন্ধানে সর্বদা',
        images: metaImage ? [{ url: metaImage }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.metaTitle || attrs.siteName || 'Satyadhara Pratidin',
        description: seo.metaDescription || attrs.siteDescription || 'সত্যধারা প্রতিদিন - সত্যের সন্ধানে সর্বদা',
        images: metaImage ? [metaImage] : [],
      }
    };
  } catch (error) {
    return {
      title: 'Satyadhara Pratidin',
      description: 'সত্যধারা প্রতিদিন - সত্যের সন্ধানে সর্বদা',
      icons: {
        icon: [
          { url: '/favicon.ico?v=5' },
          { url: '/favicon-16x16.png?v=5', sizes: '16x16', type: 'image/png' },
          { url: '/favicon-32x32.png?v=5', sizes: '32x32', type: 'image/png' },
        ],
        apple: ['/apple-touch-icon.png?v=5'],
        shortcut: ['/favicon.ico?v=5']
      }
    };
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ImportJs />
        <Providers>  
          {children}
        </Providers>
      </body>
    </html>
  )
}
