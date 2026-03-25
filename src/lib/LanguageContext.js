"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const normalizeLocale = (value) => (value === 'en' ? 'en' : 'bn');

export const LanguageProvider = ({ children, initialLocale = 'bn' }) => {
    const [locale, setLocale] = useState(normalizeLocale(initialLocale));

    useEffect(() => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const cookieLocale = normalizeLocale(getCookie('NEXT_LOCALE'));
        if (cookieLocale && cookieLocale !== locale) {
            setLocale(cookieLocale);
        }
    }, [locale]);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.classList.remove('locale-bn', 'locale-en');
            document.body.classList.add(`locale-${locale}`);
            document.documentElement.lang = locale;
        }
    }, [locale]);

    return (
        <LanguageContext.Provider value={{ locale, setLocale }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
