"use client"

import { useState, useEffect } from 'react';
import Layout from '@/components/ltr/layout/layout';
import { useBackgroundImageLoader } from '@/components/ltr/use-background-image/use-background-image';
import useRemoveBodyClass from '@/components/ltr/useEffect-hook/useEffect-hook';
import { getGlobalSettings } from '@/services/globalService';
import Link from 'next/link';
import { getStrapiMedia } from '@/lib/strapi';
import { getPrivacyData } from '@/services/privacyService';
import { useLanguage } from '@/lib/LanguageContext';
import StrapiBlocks from '@/components/article/strapi-blocks';

const PrivacyPolicyPage = () => {
    const { locale } = useLanguage();
    useRemoveBodyClass(['None'], ['home-seven', 'home-nine', 'boxed-layout', 'home-six', 'home-two']);
    useBackgroundImageLoader();

    const [privacyData, setPrivacyData] = useState(null);
    const [globalSettings, setGlobalSettings] = useState(null);

    const t = locale === 'en' ? {
        home: 'Home',
        privacy: 'Privacy Policy',
    } : {
        home: 'হোম',
        privacy: 'গোপনীয়তা নীতি',
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [privacyRes, globalRes] = await Promise.all([
                    getPrivacyData(locale),
                    getGlobalSettings(locale),
                ]);
                const privacy = privacyRes?.data?.attributes || privacyRes?.data || null;
                if (privacy) setPrivacyData(privacy);
                const settings = globalRes?.data || null;
                if (settings) setGlobalSettings(settings);
            } catch (error) {
                console.error('Error fetching privacy data:', error);
            }
        };
        fetchData();
    }, [locale]);

    const heroImageUrl = getStrapiMedia(privacyData?.heroImage) || '/assets/images/about-bg.jpg';

    return (
        <Layout hideMiddleHeader={true} globalSettings={globalSettings}>
            {/* *** START PAGE MAIN CONTENT *** */}
            <main className="page_main_wrapper">
                {/* START PAGE HEADER */}
                <section
                    className="inner-head bg-img"
                    style={{ backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                    <div className="container position-relative">
                        <div className="row">
                            <div className="col-sm-12">
                                <h2 className="entry-title">{privacyData?.title || t.privacy}</h2>
                                {privacyData?.heroDescription && (
                                    <p className="description">
                                        {privacyData.heroDescription}
                                    </p>
                                )}
                                <div className="breadcrumb">
                                    <ul className="clearfix">
                                        <li className="ib">
                                            <Link href="/">{t.home}</Link>
                                        </li>
                                        <li className="ib current-page">{privacyData?.title || t.privacy}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* END OF /. PAGE HEADER */}
                <div className="team about-content">
                    <div className="container">
                        {/* MAIN CONTENT START */}
                        <div className="about-title mb-5 mt-5">
                            {privacyData?.content && (
                                <StrapiBlocks content={privacyData.content} />
                            )}
                            {!privacyData?.content && (
                                <p className="text-center">Privacy Policy is being updated.</p>
                            )}
                        </div>
                        {/* MAIN CONTENT END */}
                    </div>
                </div>
            </main>
            {/* *** END OF /. PAGE MAIN CONTENT *** */}
        </Layout>
    );
};

export default PrivacyPolicyPage;
