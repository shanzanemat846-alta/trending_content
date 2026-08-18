'use client';

import { useEffect } from 'react';

import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Script from 'next/script';
//
import Footer from './footer';
import Header from './header';

// ----------------------------------------------------------------------
export default function MainLayout({ children }) {

  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = document.getElementById('launcher-frame');
      if (iframe) {
        iframe.style.minWidth = '88px';
        iframe.style.maxWidth = '88px';
        iframe.style.width = '88px';
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Header />
      <>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-FQ5B47DXDY"
        />
        <Script
          dangerouslySetInnerHTML={{
            __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', 'G-FQ5B47DXDY');
                    `,
          }}
        />

        {/* Microsoft Clarity */}
        <Script type="text/javascript" id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "s8pj13nz4j");
          `}
        </Script>
        {/* <Script
          id="freshdesk-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.fwSettings={ 'widget_id':70000001553 };
            !function(){
              if("function"!=typeof window.FreshworksWidget){
                var n=function(){ n.q.push(arguments) };
                n.q=[],window.FreshworksWidget=n
              }
            }()
          `,
          }}
        />
        <Script
          src="https://widget.freshworks.com/widgets/70000001553.js"
          strategy="afterInteractive"
          async
          defer
        /> */}

<Script
        id="freshdesk-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.fwSettings = { widget_id: 70000004175 };
            !function() {
              if ("function" != typeof window.FreshworksWidget) {
                var n = function() { n.q.push(arguments) };
                n.q = [], window.FreshworksWidget = n;
              }
            }()
          `,
        }}
      />
      <Script
        id="freshdesk-script"
        strategy="afterInteractive"
        src="https://widget.freshworks.com/widgets/70000004175.js"
        async
        defer
      />

        {/* <Script 
          id="freshdesk-script"
          className="freshdesk-script"
          strategy="afterInteractive"
          src="https://widget.freshworks.com/widgets/70000004175.js"
          async 
          defer
        /> */}
      </>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ...({
            pt: { xs: 8, md: 10 },
          }),
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node,
};
