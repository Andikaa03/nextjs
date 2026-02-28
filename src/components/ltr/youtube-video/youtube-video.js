"use client"
import React, { useState, useEffect } from 'react';
import { getStrapiMedia } from "@/lib/strapi";
import { useLanguage } from '@/lib/LanguageContext';

const dictionary = {
  en: {
    latestVideoNews: 'Latest Video News',
    playlist: 'Playlist',
    videoNews: 'Video News',
    loadingVideo: 'Loading: Video News...',
    pleaseWait: 'Please wait...',
    loading: 'Loading...'
  },
  bn: {
    latestVideoNews: 'সর্বশেষ ভিডিও সংবাদ',
    playlist: 'প্লেলিস্ট',
    videoNews: 'ভিডিও সংবাদ',
    loadingVideo: 'লোড হচ্ছে: ভিডিও সংবাদ...',
    pleaseWait: 'অপেক্ষা করুন...',
    loading: 'লোড হচ্ছে...'
  }
};

const getVideoId = (url) => {
  if (!url) return '';
  // Handle if only ID is passed
  if (url.length === 11 && !url.includes('/')) return url;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const dummyVideos = [
  {
    id: 'rqJDO3TWnac',
    thumbnailUrl: 'https://i.ytimg.com/vi/rqJDO3TWnac/default.jpg',
    title: 'লোড হচ্ছে: ভিডিও সংবাদ...',
    author: 'ভিজুয়ালডন',
  },
  {
    id: '3WWlhPmqXQI',
    thumbnailUrl: 'https://i.ytimg.com/vi/3WWlhPmqXQI/default.jpg',
    title: 'অপেক্ষা করুন...',
    author: 'চ্যানেল',
  },
  {
    id: 'kssD4L2NBw0',
    thumbnailUrl: 'https://i.ytimg.com/vi/kssD4L2NBw0/default.jpg',
    title: 'লোড হচ্ছে...',
    author: 'নিউজ ডেস্ক',
  },
  {
    id: 'YcwrRA2BIlw',
    thumbnailUrl: 'https://i.ytimg.com/vi/YcwrRA2BIlw/default.jpg',
    title: 'লোড হচ্ছে...',
    author: 'আপডেট',
  },
  {
    id: 'HMpmI2F2cMs',
    thumbnailUrl: 'https://i.ytimg.com/vi/HMpmI2F2cMs/default.jpg',
    title: 'লোড হচ্ছে...',
    author: 'লাইভ',
  },
];

const YoutubeVideo = ({ data = [], isLoading = false }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [autoplay, setAutoplay] = useState(0);
  const { locale } = useLanguage();
  const t = dictionary[locale] || dictionary.bn;

  // Re-define dummyVideos inside component to use t
  const dummyVideos = [
    {
      id: 'rqJDO3TWnac',
      thumbnailUrl: 'https://i.ytimg.com/vi/rqJDO3TWnac/default.jpg',
      title: t.loadingVideo,
      author: 'VisualDon',
    },
    {
      id: '3WWlhPmqXQI',
      thumbnailUrl: 'https://i.ytimg.com/vi/3WWlhPmqXQI/default.jpg',
      title: t.pleaseWait,
      author: 'Channel',
    },
    {
      id: 'kssD4L2NBw0',
      thumbnailUrl: 'https://i.ytimg.com/vi/kssD4L2NBw0/default.jpg',
      title: t.loading,
      author: 'News Desk',
    },
    {
      id: 'YcwrRA2BIlw',
      thumbnailUrl: 'https://i.ytimg.com/vi/YcwrRA2BIlw/default.jpg',
      title: t.loading,
      author: 'Update',
    },
    {
      id: 'HMpmI2F2cMs',
      thumbnailUrl: 'https://i.ytimg.com/vi/HMpmI2F2cMs/default.jpg',
      title: t.loading,
      author: 'Live',
    },
  ];

  useEffect(() => {
    if (isLoading) {
      setVideos(dummyVideos);
    } else if (data && data.length > 0) {
      const formattedVideos = data.map(item => {
        const v = item.attributes || item;
        const videoId = getVideoId(v.youtubeUrl || v.videoUrl);
        
        // Handle thumbnail from dedicated collection or fallback to youtube default
        const thumbData = v.thumbnail?.data?.attributes || v.thumbnail?.attributes || v.thumbnail?.data || v.thumbnail;
        const thumbUrl = thumbData ? getStrapiMedia(thumbData) : `https://i.ytimg.com/vi/${videoId}/default.jpg`;

        return {
          id: videoId || 'rqJDO3TWnac', // fallback
          thumbnailUrl: thumbUrl,
          title: v.title,
          author: 'Youtube',
        };
      });
      setVideos(formattedVideos);
    } else {
      setVideos(dummyVideos); // Fallback to dummy if empty or show empty state? Let's show dummy for now or logic to hide
    }
  }, [data, isLoading]);

  const handleThumbnailClick = (index) => {
    setSelectedVideo(index);
    setAutoplay(1);
  };
  
  if (!isLoading && data.length === 0) return null; // Hide if no real data

  const displayVideos = videos.slice(0, 5);

  return (
    <div className="youtube-wrapper">
      <div className="playlist-title">
        <h4>{t.latestVideoNews}</h4>
      </div>
      <div id="rypp-demo-1" className="RYPP r16-9" data-rypp="da4e5dd6">
        <div>
          <div className="RYPP-playlist">
            <header>
              <h2 className="_h1 RYPP-title">{t.playlist}</h2>
              <p className="RYPP-desc">
                {t.videoNews} <a href="#" target="_blank">#Video</a>
              </p>
            </header>
            <div className="RYPP-items">
              <ol>
                {displayVideos.map((video, index) => (
                  <li
                    key={`thumbnail-${index}`}
                    data-video-id={video.id}
                    className={selectedVideo === index ? 'selected' : ''}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <p className="title">
                      {video.title}
                      <small className="author">
                        <br />
                        {video.author}
                      </small>
                    </p>
                    <img
                      src={video.thumbnailUrl}
                      className="thumb"
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => e.target.src = '/default.jpg'}
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        <div className="RYPP-video">
            {displayVideos[selectedVideo] && (
            <iframe
              key={`RYPP-vp-${selectedVideo}-${displayVideos[selectedVideo].id}-${autoplay}`}
              className="RYPP-video-player"
              style={{ display: 'block' }}
              id={`RYPP-vp-da4e5dd6-${selectedVideo}`}
              name={`RYPP-vp-da4e5dd6-${selectedVideo}`}
              frameBorder="0"
              allowFullScreen
              title="YouTube Video Player"
              width="640"
              height="360"
              src={`https://www.youtube.com/embed/${displayVideos[selectedVideo].id}?autoplay=${autoplay}`}
            ></iframe>
            )}
        </div>
      </div>
    </div>
  );
};

export default YoutubeVideo;