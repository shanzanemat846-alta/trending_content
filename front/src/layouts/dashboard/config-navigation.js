import { useMemo, useContext } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import { AuthContext } from 'src/auth/context/jwt/auth-context';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import NearMeIcon from '@mui/icons-material/NearMe';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import { def_id } from 'src/config-global';
// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();
  const { user } = useContext(AuthContext);

  const id = localStorage.getItem('projectID') || def_id;

  const data = useMemo(() => {

    let navigationData = [];

    if (user?.role === 'user') {
      navigationData = [
        {
          subheader: t('Main'),
          items: [
            {
              title: t('projects'),
              path: paths.dashboard.tour.root,
              icon: <LibraryBooksIcon />,
            },
          ],
        },
        {
          subheader: t('Utility'),
          items: [
            {
              title: t('prompts'),
              path: paths.dashboard.post.root,
              icon: <NearMeIcon />
            },
            {
              title: t('profile'),
              path: paths.dashboard.user.root,
              icon: <PersonIcon />,
            },
          ],
        },
      ];

      if (id) {
        navigationData[0].items[0].children = [
          { title: t('list'), path: paths.dashboard.tour.root },
          {
            title: t('threads'),
            path: paths.dashboard.tour.threads(id),
          },
          {
            title: t('campaigns'),
            path: paths.dashboard.tour.job.root(id),
          },
          { title: t('Contents'), path: paths.dashboard.tour.store.root(id) },
          {
            title: t('chatGPT'),
            path: paths.dashboard.tour.chatgpt(id),
          },
        ];
      }
    }

    if (user?.role === 'admin') {
      navigationData.push({
        subheader: t('Admin'),
        items: [
          {
            title: t('users'),
            path: paths.dashboard.user.list,
            icon: <PeopleAltIcon />,
          },
          {
            title: t('profile'),
            path: paths.dashboard.user.root,
            icon: <PersonIcon />,
          },
          {
            title: t('prompts'),
            path: paths.dashboard.post.root,
            icon: <NearMeIcon />
          },
          {
            title: t('demographics'),
            path: paths.dashboard.demography.root,
            icon: <LibraryBooksIcon />,
          },
          {
            title: t('credits History'),
            path: paths.dashboard.creditsHistory.root,
            icon: <LibraryBooksIcon />,
          },
        ],
      });
    }

    return navigationData;
  }, [t, user, id]);

  return data;
}
