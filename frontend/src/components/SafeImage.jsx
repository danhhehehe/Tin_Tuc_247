import { useEffect, useState } from 'react';

export const FALLBACK_IMAGE = '/logo-tintuc247.svg';

export default function SafeImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt || 'Tin Tức 247'}
      className={`${className || ''}${imgSrc === FALLBACK_IMAGE ? ' fallback-logo-image' : ''}`.trim()}
      onError={() => setImgSrc(FALLBACK_IMAGE)}
      loading="lazy"
    />
  );
}
