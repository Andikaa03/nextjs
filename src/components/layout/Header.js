'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { WiDayLightning } from 'weather-icons-react';
import ThemeChanger from '../common/ThemeChanger';
import { getStrapiMedia } from "@/lib/strapi";
import { getCategories } from "@/services/categoryService";
import { getGlobalSettings } from "@/services/globalService";
import { useLanguage } from '@/context/LanguageContext';

const Header = () => {
    const { language, toggleLanguage } = useLanguage();
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [isOverlayActive, setOverlayActive] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalSettings, setGlobalSettings] = useState(null);
    const path = usePathname();

    const t = {
        bn: {
            allSections: 'সব বিভাগ',
            home: 'প্রথম পাতা',
            epaper: 'ই-পেপার',
            searchPlaceholder: 'অনুসন্ধান করুন...',
            sidebarIntro: 'সর্বশেষ বাংলা সংবাদ এবং আপডেট পান আমাদের সাথে।',
            contactUs: 'আমাদের সাথে যোগাযোগ',
            dateLocale: 'bn'
        },
        en: {
            allSections: 'All Sections',
            home: 'Home',
            epaper: 'E-Paper',
            searchPlaceholder: 'Search...',
            sidebarIntro: 'Get the latest news and updates with us.',
            contactUs: 'Contact Us',
            dateLocale: 'en-US'
        }
    };

    const currentT = t[language] || t.bn;
    const locale = language === 'bn' ? 'bn' : 'en';

    // Monitor theme changes is no longer needed for the logo as it's handled by CSS
    // but we keep it if other components need it, or remove it if not.
    // In this case, only the logo was using it.


    // Fetch categories from Strapi
    useEffect(() => {
        async function fetchCategories() {
            setLoading(true);
            try {
                const response = await getCategories(locale);
                setCategories(response?.data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, [language]);

    // Fetch global settings separately (non-blocking for nav)
    useEffect(() => {
        async function fetchGlobal() {
            try {
                const response = await getGlobalSettings(locale);
                if (response?.data) {
                    setGlobalSettings(response.data);
                }
            } catch (error) {
                console.error('Error fetching global settings:', error);
            }
        }
        fetchGlobal();
    }, [language]);
   
    const toggleSidebar = () => {
        setSidebarActive(!isSidebarActive);
        setOverlayActive(!isOverlayActive);
    };

    const closeSidebar = () => {
        setSidebarActive(false);
        setOverlayActive(false);
    };

    useEffect(() => {
        const dismissOverlay = document.querySelector('#dismiss');
        const overlay = document.querySelector('.overlay');
        const navIcon = document.querySelector('#nav-icon');

        if (dismissOverlay && overlay) {
            dismissOverlay.addEventListener('click', closeSidebar);
            overlay.addEventListener('click', closeSidebar);
        }

        if (navIcon) {
            navIcon.addEventListener('click', toggleSidebar);
        }

        // Cleanup function for removing event listeners
        return () => {
            if (dismissOverlay && overlay) {
                dismissOverlay.removeEventListener('click', closeSidebar);
                overlay.removeEventListener('click', closeSidebar);
            }
            if (navIcon) {
                navIcon.removeEventListener('click', toggleSidebar);
            }
        };
    }, [isSidebarActive, isOverlayActive]);
    
    useEffect(() => {
        const fullSkinSearch = () => {
            let wHeight = window.innerHeight;

            // Search bar middle alignment
            const fullscreenSearchform = document.getElementById('fullscreen-searchform');
            if (fullscreenSearchform) {
                fullscreenSearchform.style.top = `${wHeight / 2}px`;
            }

            // Reform search bar on window resize
            window.addEventListener('resize', () => {
                wHeight = window.innerHeight;
                if (fullscreenSearchform) {
                    fullscreenSearchform.style.top = `${wHeight / 2}px`;
                }
            });
        };

        fullSkinSearch(); // Call the function once the component is mounted

        // Cleanup function if needed
        return () => {
            // Remove event listeners or perform cleanup if required
        };
    }, []);

    const handleSearchButtonClick = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const handleCloseButtonClick = () => {
        setIsSearchOpen(false);
    };

    return (
        <>
            {/* *** START PAGE HEADER SECTION *** */}
            <header>
                {/* START MIDDLE SECTION */}
                <div className="d-md-block d-none header-mid">
                    <div className="container">
                        <div className="align-items-center row justify-content-center">
                            <div className="col">
                                <div className="hstack gap-3">
                                    <div id="nav-icon" className={isSidebarActive ? 'open' : ''}>
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                    <div className="vr" />
                                    <span className="fw-semibold text-uppercase menu-text">
                                        {currentT.allSections}
                                    </span>
                                </div>
                            </div>
                            <div className="col-auto">
                                <div className="align-items-center d-flex gap-3">
                                    {/* Start logo */}
                                    <Link href={`/${language}`} className="header-logo">
                                        <Image
                                            src="/logo-white.png"
                                            className="img-fluid logo-light-img"
                                            alt={globalSettings?.siteName || 'Logo'}
                                            width={251}
                                            height={67}
                                            priority
                                        />
                                        <Image
                                            src="/logo-dark.png"
                                            className="img-fluid logo-dark-img"
                                            alt={globalSettings?.siteName || 'Logo'}
                                            width={251}
                                            height={67}
                                            priority
                                        />
                                    </Link>
                                    {/* Dark/Light Mode Toggle - Moved to right side */}
                                </div>
                            </div>
                            <div className="col text-end fw-semibold text-uppercase date-text">
                                {new Date().toLocaleDateString(currentT.dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
                {/* END OF /. MIDDLE SECTION */}
                {/* START NAVIGATION */}
                <nav className="custom-navbar navbar navbar-expand sticky-top flex-column no-logo no-logo">
                    {/* Start Fullscreen Search */}
                    <div className={`fullscreen-search-overlay ${isSearchOpen ? 'fullscreen-search-overlay-show' : ''}`} >
                        <Link
                            href="#"
                            className="fullscreen-close"
                            onClick={handleCloseButtonClick}
                            id="fullscreen-close-button"
                            aria-label="Close search"
                        >
                            <i className="ti ti-close" />
                        </Link>
                        <div id="fullscreen-search-wrapper">
                            <form method="get" id="fullscreen-searchform" action={`/${language}/search`}>
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue=""
                                    placeholder={currentT.searchPlaceholder}
                                    id="fullscreen-search-input"
                                />
                                <button type="submit" className="search-btn-overlay" style={{ background: 'none', border: 'none' }}>
                                    <i className="ti ti-search fullscreen-search-icon" />
                                </button>
                            </form>
                        </div>
                    </div>
                    {/* /. End Fullscreen Search */}

                    {/* MOBILE TOP ROW: Burger, Logo, Icons (Hidden on Desktop) */}
                    <div className="container d-md-none border-bottom py-2">
                        <div className="d-flex align-items-center justify-content-between w-100">
                            {/* Mobile Burger Menu Icon */}
                            <div id="nav-icon-mobile" className={isSidebarActive ? 'open' : ''} onClick={toggleSidebar}>
                                <span />
                                <span />
                                <span />
                            </div>

                            {/* Mobile Logo */}
                            <Link className="navbar-brand-mobile" href={`/${language}`}>
                                <Image
                                    src="/logo-white.png"
                                    className="img-fluid logo-light-img"
                                    alt={globalSettings?.siteName || 'Logo'}
                                    width={150}
                                    height={40}
                                    priority
                                />
                                <Image
                                    src="/logo-dark.png"
                                    className="img-fluid logo-dark-img"
                                    alt={globalSettings?.siteName || 'Logo'}
                                    width={150}
                                    height={40}
                                    priority
                                />
                            </Link>

                            {/* Mobile Right Icons (Language, Theme, Search) */}
                            <div className="d-flex align-items-center gap-2">
                                <div className="language-toggle d-flex gap-1 align-items-center me-1">
                                    <button 
                                        className={`btn btn-sm ${language === 'bn' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                        onClick={() => language !== 'bn' && toggleLanguage()}
                                        style={{ fontSize: '10px', padding: '2px 5px' }}
                                    >
                                        বাংলা
                                    </button>
                                    <button 
                                        className={`btn btn-sm ${language === 'en' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                        onClick={() => language !== 'en' && toggleLanguage()}
                                        style={{ fontSize: '10px', padding: '2px 5px' }}
                                    >
                                        EN
                                    </button>
                                </div>
                                <ThemeChanger />
                                <button
                                    type="button"
                                    className="btn btn-search_two p-0"
                                    onClick={handleSearchButtonClick}
                                    aria-label="Search"
                                >
                                    <i className="fa fa-search" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CATEGORY & DESKTOP ROW */}
                    <div className="container position-relative">
                        {/* Desktop Navbar Brand (Removed logo as it's already in header-mid) */}
                        <div className="navbar-brand d-none d-md-block"></div>

                        <div className="navbar-nav-container" id="navbarSupportedContent">
                            <ul className="navbar-nav">
                                {/* প্রথম পাতা (Home) */}
                                <li className="nav-item">
                                    <Link className={`nav-link ${path === `/${language}` ? 'active' : ''}`} href={`/${language}`}>
                                        {currentT.home}
                                    </Link>
                                </li>

                                {/* ই-পেপার (E-Paper) - Moved to front for mobile visibility */}
                                <li className="nav-item">
                                    <Link className={`nav-link ${path === `/${language}/epaper` ? 'active' : ''}`} href={`/${language}/epaper`}>
                                        {currentT.epaper}
                                    </Link>
                                </li>
                                
                                {/* Dynamic Categories from Strapi */}
                                {loading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <li key={`skeleton-${i}`} className="nav-item">
                                                <a className="nav-link">
                                                    <div className="skeleton-loader" style={{ width: '80px', height: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                                                </a>
                                            </li>
                                        ))}
                                    </>
                                )}
                                
                                {!loading && categories.slice(0, 10).map((category) => (
                                    <li key={category.id} className="nav-item">
                                        <Link 
                                            className={`nav-link ${path === `/${language}/category/${category.slug}` ? 'active' : ''}`} 
                                            href={`/${language}/category/${category.slug}`}
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Desktop Actions (Hidden on Mobile) */}
                        <div className="d-none d-md-flex align-items-center flex-nowrap ms-auto gap-2">
                            <div className="language-toggle d-flex gap-1 align-items-center me-2">
                                <button 
                                    className={`btn btn-sm ${language === 'bn' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                    onClick={() => language !== 'bn' && toggleLanguage()}
                                    style={{ fontSize: '10px', padding: '2px 5px' }}
                                >
                                    বাংলা
                                </button>
                                <button 
                                    className={`btn btn-sm ${language === 'en' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                    onClick={() => language !== 'en' && toggleLanguage()}
                                    style={{ fontSize: '10px', padding: '2px 5px' }}
                                >
                                    EN
                                </button>
                            </div>
                            <ThemeChanger />
                            <button
                                type="button"
                                className="btn btn-search_two flex-shrink-0"
                                onClick={handleSearchButtonClick}
                                aria-label="Search"
                            >
                                <i className="fa fa-search" />
                            </button>
                        </div>
                    </div>
                </nav>
                {/* END OF/. NAVIGATION */}
                {/* START SIDEBAR */}
                <nav id="sidebar" className={isSidebarActive ? "active p-4" : "p-4"} >
                    <div id="dismiss">
                        <i className="fas fa-arrow-left" />
                    </div>
                    <div className="d-flex flex-column h-100">
                        <div className="">
                            <Link href={`/${language}`} className="d-inline-block my-3">
                                <Image
                                    src="/logo-white.png"
                                    className="img-fluid logo-light-img"
                                    alt={globalSettings?.siteName || 'Logo'}
                                    width={178}
                                    height={58}
                                />
                                <Image
                                    src="/logo-dark.png"
                                    className="img-fluid logo-dark-img"
                                    alt={globalSettings?.siteName || 'Logo'}
                                    width={178}
                                    height={58}
                                />
                            </Link>
                            <p>
                                {currentT.sidebarIntro}
                            </p>
                        </div>
                        <ul className="nav d-block flex-column my-4">
                            <li className="nav-item h5">
                                <Link className="nav-link" href={`/${language}`}>
                                    {currentT.home}
                                </Link>
                            </li>
                            {categories.slice(0, 5).map((category) => (
                                <li key={category.id} className="nav-item h5">
                                    <Link className="nav-link" href={`/${language}/category/${category.slug}`}>
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-auto pb-3">
                            {/* Address */}
                            <p className="mb-2 fw-bold">{currentT.contactUs}</p>
                            <Link href="#" className="d-block text-white">
                                info@shottyodharaprotidin.com
                            </Link>
                        </div>
                    </div>
                </nav>
                {/* END OF /. SIDEBAR */}
                <div className={isOverlayActive ? "overlay active" : "overlay"} />

            </header>
            {/* *** END OF /. PAGE HEADER SECTION *** */}

        </>
    );
};

export default Header;