'use client';

import { useEffect } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/routes/hooks';
import MainLayout from 'src/layouts/main';
import AboutView from './about-view';

export default function MainView() {
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard/');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  return (
    <MainLayout>
      <AboutView />
    </MainLayout>
  );
}