"use client";

import { useEffect, useState } from 'react';
import { getShareCounts, incrementShareCount } from '@/services/shareCountService';

/**
 * Floating Social Share Bar
 * Renders inside `figure.social-icon` to leverage the existing CSS
 * that shows floating share buttons on hover over the article cover image.
 * Also tracks share counts per platform.
 */
const SocialShare = ({ title, slug, articleId }) => {
  const [articleUrl, setArticleUrl] = useState('');
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    const baseUrl = window.location.origin;
    setArticleUrl(`${baseUrl}/article/${slug}`);
  }, [slug]);

  // Fetch share counts
  useEffect(() => {
    if (!articleId) return;
    getShareCounts(articleId).then(setCounts);
  }, [articleId]);

  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title || '');

  const shareLinks = [
    {
      name: 'Facebook',
      key: 'facebook',
      icon: 'fab fa-facebook-f',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Twitter',
      key: 'twitter',
      icon: 'fab fa-twitter',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'WhatsApp',
      key: 'whatsapp',
      icon: 'fab fa-whatsapp',
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Pinterest',
      key: 'pinterest',
      icon: 'fab fa-pinterest-p',
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    },
    {
      name: 'LinkedIn',
      key: 'linkedin',
      icon: 'fab fa-linkedin-in',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  if (!articleUrl) return null;

  const handleShare = async (link) => {
    // Open share window
    window.open(link.url, `share-${link.name}`, 'width=600,height=400,menubar=no,toolbar=no');

    // Track the share count
    if (articleId) {
      incrementShareCount(articleId, link.key);
      // Optimistically update count
      if (counts) {
        setCounts(prev => ({
          ...prev,
          [link.key]: (prev[link.key] || 0) + 1,
        }));
      }
    }
  };

  return (
    <div>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${link.name}${counts ? ` (${counts[link.key] || 0})` : ''}`}
          onClick={(e) => {
            e.preventDefault();
            handleShare(link);
          }}
        >
          <i className={link.icon} />
        </a>
      ))}
    </div>
  );
};

export default SocialShare;
