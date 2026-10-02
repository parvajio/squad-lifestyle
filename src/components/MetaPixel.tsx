'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { FB_PIXEL_ID, pixelPageView } from '@/lib/fpixel';

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Stable string dep: the searchParams object identity changes every render,
  // its serialized value only changes on a real navigation.
  const queryString = searchParams?.toString() ?? '';

  // The single source of PageView: runs on initial mount and on every real
  // URL change. The init snippet below deliberately sends NO PageView, so an
  // initial load cannot produce two. (In `next dev`, React StrictMode
  // intentionally double-invokes mount effects, so the very first load may
  // show two PageViews locally; production builds mount once. Verify final
  // counts with `npm run build && npm start` or a preview deployment.)
  useEffect(() => {
    pixelPageView();
  }, [pathname, queryString]);

  if (!FB_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('set', 'autoConfig', false, '${FB_PIXEL_ID}');
            fbq('init', '${FB_PIXEL_ID}');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
