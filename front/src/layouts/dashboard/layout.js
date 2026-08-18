'use client';

import PropTypes from 'prop-types';
import Script from 'next/script'; 
import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';

// ----------------------------------------------------------------------
export default function DashboardLayout({ children }) {
  const settings = useSettingsContext();

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean();

  const isHorizontal = settings.themeLayout === 'horizontal';

  const isMini = settings.themeLayout === 'mini';

  const renderNavMini = <NavMini />;

  const renderHorizontal = <NavHorizontal />;

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;

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

  if (isHorizontal) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />

        {lgUp ? renderHorizontal : renderNavVertical}

        <Main>{children}</Main>
      </>
    );
  }

  if (isMini) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />

        <Box
          sx={{
            minHeight: 1,
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
          }}
        >
          {lgUp ? renderNavMini : renderNavVertical}

          <Main>{children}</Main>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header onOpenNav={nav.onTrue} />
        <>
         {/* Google Tag */}
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
        </>
      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {renderNavVertical}

        <Main>{children}</Main>
      </Box>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
