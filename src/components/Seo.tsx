/// <reference types="react" />
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://ogzzmc.fun';
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.svg`;
const DEFAULT_KEYWORDS = [
  'OGzz MC',
  'Minecraft Server',
  'Minecraft Store',
  'Minecraft Ranks',
  'Minecraft Coins',
  'Minecraft Bundles',
  'OGzz MC Store',
].join(', ');

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  keywords?: string | string[];
  noIndex?: boolean;
}

function toAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return new URL(path.startsWith('/') ? path : `/${path}`, SITE_URL).toString();
}

export default function Seo({
  title,
  description,
  path = '/',
  type = 'website',
  keywords = DEFAULT_KEYWORDS,
  noIndex = false,
}: SeoProps) {
  const canonicalUrl = toAbsoluteUrl(path);
  const robots = noIndex ? 'noindex, nofollow' : 'index, follow';
  const resolvedKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={resolvedKeywords} />
      <meta name="author" content="OGzz MC" />
      <meta name="theme-color" content="#0a0a0a" />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content="OGzz MC Store" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:image:alt" content="OGzz MC Minecraft Server Store icon" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      <meta name="twitter:url" content={canonicalUrl} />
    </Helmet>
  );
}
