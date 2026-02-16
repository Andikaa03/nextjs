/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
      })
    );
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'app.shottyodharaprotidin.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'shottyodharaprotidin-media.s3.ap-southeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'media.shottyodharaprotidin.com',
      }
    ],
  },
  
};

  

module.exports = nextConfig;
