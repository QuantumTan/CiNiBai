import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'video.movie' | 'video.tv_show' | 'article';
  schema?: Record<string, any>;
}

export function SEO({
  title = 'CineBai - Watch Free Movies & TV Shows Online in HD',
  description = 'Watch full movies, TV series, anime, and trending streaming releases for free in HD on CineBai with fast servers and multiple playback options.',
  image = 'https://cinibai.vercel.app/favicon.svg',
  url,
  type = 'website',
  schema,
}: SEOProps) {
  useEffect(() => {
    // Update Document Title
    const formattedTitle = title.includes('CineBai') ? title : `${title} | CineBai`;
    document.title = formattedTitle;

    // Helper function to update or create meta tags
    const setMetaTag = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // Open Graph Meta
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', formattedTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    if (url) {
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
    }

    // Twitter Card Meta
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', formattedTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    // Schema JSON-LD injection if provided
    let schemaScript: HTMLScriptElement | null = null;
    if (schema) {
      schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.innerHTML = JSON.stringify(schema);
      schemaScript.setAttribute('data-dynamic-seo', 'true');
      document.head.appendChild(schemaScript);
    }

    return () => {
      if (schemaScript && schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, [title, description, image, url, type, schema]);

  return null;
}
