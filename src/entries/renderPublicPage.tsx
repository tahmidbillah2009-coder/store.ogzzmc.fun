import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import Seo from '../components/Seo';
import SiteLayout from '../components/SiteLayout';
import { getSeoForPath } from '../site/seo';
import '../index.css';

export function renderPublicPage(pathname: string, page: ReactNode) {
  const seo = getSeoForPath(pathname);

  createRoot(document.getElementById('root')!).render(
    <HelmetProvider>
      <AuthProvider>
        <SettingsProvider>
          <Seo
            title={seo.title}
            description={seo.description}
            path={pathname}
            keywords={seo.keywords}
            type={seo.type}
            noIndex={seo.noIndex}
          />
          <SiteLayout>{page}</SiteLayout>
        </SettingsProvider>
      </AuthProvider>
    </HelmetProvider>,
  );
}
