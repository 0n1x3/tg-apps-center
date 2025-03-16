import { useState, useEffect, useCallback } from 'react';

const FALLBACK_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E`;

const useImagePreloader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const imageCache: { [key: string]: string } = {};
    let loadedCount = 0;

    const checkAllLoaded = () => {
      if (isMounted && loadedCount === imageUrls.length) {
        setIsLoading(false);
      }
    };

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (isMounted) {
          imageCache[url] = url;
          setLoadedImages(prev => ({ ...prev, [url]: url }));
          loadedCount++;
          checkAllLoaded();
        }
      };
      img.onerror = () => {
        if (isMounted) {
          console.error(`Failed to load image: ${url}`);
          imageCache[url] = FALLBACK_SVG;
          setLoadedImages(prev => ({ ...prev, [url]: FALLBACK_SVG }));
          loadedCount++;
          checkAllLoaded();
        }
      };
    });

    return () => {
      isMounted = false;
    };
  }, [imageUrls]);

  const getImageUrl = useCallback((url: string) => {
    return loadedImages[url] || url;
  }, [loadedImages]);

  return { getImageUrl, isLoading };
};

export default useImagePreloader;