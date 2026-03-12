"use client"

import { useState, useEffect } from 'react';
import Layout from '@/components/ltr/layout/layout';
import { useBackgroundImageLoader } from '@/components/ltr/use-background-image/use-background-image';
import useRemoveBodyClass from '@/components/ltr/useEffect-hook/useEffect-hook';
import { getGlobalSettings } from '@/services/globalService';
import Link from 'next/link';
import { getStrapiMedia, formatDate } from '@/lib/strapi';
import { getAboutData } from '@/services/aboutService';
import { getAboutPageArticles } from '@/services/articleService';
import { useLanguage } from '@/lib/LanguageContext';
import StrapiBlocks from '@/components/article/strapi-blocks';

const AboutPage = () => {
    const { locale } = useLanguage();
    useRemoveBodyClass(['None'], ['home-seven', 'home-nine', 'boxed-layout', 'home-six', 'home-two']);
    useBackgroundImageLoader();

    const [aboutData, setAboutData] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [globalSettings, setGlobalSettings] = useState(null);

    const t = locale === 'en' ? {
        home: 'Home',
        about: 'About',
        relatedTitle: 'Related Articles',
    } : {
        home: 'হোম',
        about: 'আমাদের সম্পর্কে',
        relatedTitle: 'সম্পর্কিত নিবন্ধ',
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aboutRes, articlesRes, globalRes] = await Promise.all([
                    getAboutData(locale),
                    getAboutPageArticles(4, locale),
                    getGlobalSettings(locale),
                ]);
                const about = aboutRes?.data?.attributes || aboutRes?.data || null;
                if (about) setAboutData(about);
                const articles = articlesRes?.data || [];
                if (articles.length > 0) setRelatedArticles(articles);
                const settings = globalRes?.data || null;
                if (settings) setGlobalSettings(settings);
            } catch (error) {
                console.error('Error fetching about data:', error);
            }
        };
        fetchData();
    }, [locale]);

    const heroImageUrl = getStrapiMedia(aboutData?.heroImage) || '/assets/images/about-bg.jpg';
    const teamMembers = aboutData?.teamMembers || [];

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
                                <h2 className="entry-title">{aboutData?.title || t.about}</h2>
                                {aboutData?.heroDescription && (
                                    <p className="description">
                                        {aboutData.heroDescription}
                                    </p>
                                )}
                                <div className="breadcrumb">
                                    <ul className="clearfix">
                                        <li className="ib">
                                            <Link href="/">{t.home}</Link>
                                        </li>
                                        <li className="ib current-page">{aboutData?.title || t.about}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* END OF /. PAGE HEADER */}
                <div className="team about-content">
                    <div className="container">
                        {/* MISSION SECTION - only if filled */}
                        {(aboutData?.missionTitle || aboutData?.mission) && (
                            <div className="about-title">
                                {aboutData?.missionTitle && <h1>{aboutData.missionTitle}</h1>}
                                {aboutData?.missionSubtitle && (
                                    <h3>{aboutData.missionSubtitle}</h3>
                                )}
                                {aboutData?.mission && (
                                    <StrapiBlocks content={aboutData.mission} />
                                )}
                            </div>
                        )}

                        {/* VISION SECTION - only if filled */}
                        {aboutData?.vision && (
                            <div className="about-title">
                                <StrapiBlocks content={aboutData.vision} />
                            </div>
                        )}

                        {/* TEAM MEMBERS SECTION - only if filled */}
                        {teamMembers.length > 0 && (
                            <div className="row">
                                <div className="col-12">
                                    <h2>{aboutData?.teamSectionTitle || t.about} </h2>
                                </div>
                                {/* end col-12 */}
                                {teamMembers.map((member, index) => {
                                    const photoUrl = getStrapiMedia(member.photo);
                                    const socialLinks = member.socialLinks || [];
                                    return (
                                        <div className="col-6 col-md-3" key={member.id || index}>
                                            <figure className="member">
                                                {" "}
                                                {photoUrl && (
                                                    <img
                                                        src={photoUrl}
                                                        className="img-fluid"
                                                        alt={member.name || 'Image'}
                                                    />
                                                )}
                                                <figcaption>
                                                    <h4>{member.name}</h4>
                                                    {member.role && <small>{member.role}</small>}
                                                    {socialLinks.length > 0 && (
                                                        <ul>
                                                            {socialLinks.map((social, si) => (
                                                                <li key={si}>
                                                                    <Link href={social.url || '#'} target="_blank">
                                                                        <i className={social.icon} />
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </figcaption>
                                            </figure>
                                            {/* end member */}
                                        </div>
                                    );
                                })}
                                {/* end col-3 */}
                            </div>
                        )}
                        {/* end row */}

                        {/* HISTORY SECTION - only if filled */}
                        {(aboutData?.historyTitle || aboutData?.history) && (
                            <div className="about-title">
                                {aboutData?.historyTitle && <h2>{aboutData.historyTitle}</h2>}
                                {aboutData?.history && (
                                    <StrapiBlocks content={aboutData.history} />
                                )}
                            </div>
                        )}
                

                        {/* RELATED ARTICLES - only if there are articles */}
                        {relatedArticles.length > 0 && (
                            <>
                                <h2>{t.relatedTitle}</h2>
                                <div className="news-grid-2">
                                    <div className="row">
                                        {relatedArticles.map((article) => {
                                            const data = article.attributes || article;
                                            const imageUrl = getStrapiMedia(data.cover);
                                            return (
                                                <div className="col-6 col-md-3" key={article.id}>
                                                    <div className="grid-item">
                                                        <div className="grid-item-img">
                                                            <Link href={`/article/${data.slug}`}>
                                                                <img
                                                                    src={imageUrl || '/default.jpg'}
                                                                    className="img-fluid"
                                                                    alt={data.title}
                                                                />
                                                            </Link>
                                                        </div>
                                                        <h5>
                                                            <Link href={`/article/${data.slug}`} className="title">
                                                                {data.title && data.title.length > 60 ? data.title.substring(0, 60) + '...' : data.title}
                                                            </Link>
                                                        </h5>
                                                        <ul className="authar-info d-flex flex-wrap">
                                                            <li>{formatDate(data.publishedAt, locale)}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
            {/* *** END OF /. PAGE MAIN CONTENT *** */}


        </Layout>
    );
};

export default AboutPage;
