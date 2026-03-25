"use client"
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/lib/LanguageContext'

const Providers = ({ children, initialLocale = 'bn' }) => {
  return (
    <LanguageProvider initialLocale={initialLocale}>
        <ThemeProvider 
        attribute="data-theme"
        defaultTheme="skin-dark"
        themes={['light', 'skin-dark']}
        enableSystem={false}
        disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    </LanguageProvider>
  )
}

export default Providers