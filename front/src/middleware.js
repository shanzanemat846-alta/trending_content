import { NextResponse } from 'next/server';
import { paths } from 'src/routes/paths';

import { USERS_ROLE, USER_STATUS } from './utils/constants';

export function middleware(req) {
  const pathname = req.nextUrl.pathname.replace(/\/$/, '');
  const role = req.cookies.get('userRole')?.value;
  const status = req.cookies.get('status')?.value;

  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const protectedPaths = [
    paths.payment,
    paths.pricing,
    paths.dashboard.userProfile.root,
    paths.dashboard.user.cards,
    paths.dashboard.user.account,
    paths.dashboard.user.new
  ];

  if (protectedPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/not-found', req.url));
  }

  if (role === USERS_ROLE.ADMIN) {
    const dashboardRootPath = paths.dashboard.root.replace(/\/$/, '');

    const restrictedAdminPaths = [
      dashboardRootPath,
      paths.dashboard.chat,
      paths.dashboard.kanban,
      paths.dashboard.general.app,
      paths.dashboard.general.analytics,
      paths.dashboard.product.root,
      paths.dashboard.tour.root,
      paths.dashboard.tour.chatgpt,
      paths.dashboard.tour.threads,
      paths.dashboard.tour.store.root,
      paths.dashboard.tour.job.root,
    ];

    const isRestricted = restrictedAdminPaths.some((route) => pathname.startsWith(route));
    const isAllowedAdminUserPath =
      pathname.startsWith(paths.dashboard.user.list) ||
      pathname.startsWith(paths.dashboard.user.root) ||
      pathname.startsWith(paths.dashboard.post.root) ||
      pathname.startsWith(paths.dashboard.demography.root) || 
      pathname.startsWith(paths.dashboard.creditsHistory.root)

    if (isRestricted && !isAllowedAdminUserPath) {
      return NextResponse.redirect(new URL('/not-found', req.url));
    }
  } else if (role === USERS_ROLE.USER) {

    if (pathname.startsWith(paths.dashboard.user.list)) {
      return NextResponse.redirect(new URL('/not-found', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*']
};
