import '@fortawesome/fontawesome-free/css/all.min.css';
import "@icon/themify-icons/themify-icons.css"
import './globals.css'

import ImportJs from '@/components/ltr/import-js/import-js';
import Providers from './theme-providers';
import { getGlobalSettings } from '@/services/globalService';

export async function generateMetadata() {
  try {
    const globalRes = await getGlobalSettings('bn');
    const attrs = globalRes?.data?.attributes || {};
    const seo = attrs.defaultSeo || {};
    
    const faviconData = attrs.favicon?.data?.attributes;
    const faviconUrl = faviconData?.url 
      ? (faviconData.url.startsWith('http') ? faviconData.url : `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${faviconData.url}`)
      : null;

    const defaultIcons = {
      icon: [
        { url: '/favicon.ico?v=5' },
        { url: '/favicon-16x16.png?v=5', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png?v=5', sizes: '32x32', type: 'image/png' },
      ],
      apple: ['/apple-touch-icon.png?v=5'],
      shortcut: ['/favicon.ico?v=5']
    };

    return {
      title: seo.metaTitle || attrs.siteName || 'Satyadhara Pratidin',
      description: seo.metaDescription || attrs.siteDescription || 'সত্যধারা প্রতিদিন - সত্যের সন্ধানে সর্বদা',
      icons: faviconUrl ? {
        icon: [{ url: faviconUrl }],
        shortcut: [faviconUrl],
        apple: [faviconUrl]
      } : defaultIcons
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
