import Head from 'next/head'

import MainView from '../sections/about/view/main-view';

export const metadata = {
  title: 'home',
};

export default function Page() {
  return (
    <>
    <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
    <MainView />
    </>
  );
}
