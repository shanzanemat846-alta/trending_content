'use client';

import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import TourNewEditForm from '../tour-new-edit-form';

// ----------------------------------------------------------------------

export default function TourEditView({ id }) {
  const settings = useSettingsContext();

  const projects = JSON.parse(localStorage.getItem('projects'));

  const currentTour = projects?.find((tour) => tour._id === id);
  console.log("currentproject", currentTour);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Projects',
            href: paths.dashboard.tour.root,
          },
          { name: currentTour?.title },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TourNewEditForm currentTour={currentTour} />
    </Container>
  );
}

TourEditView.propTypes = {
  id: PropTypes.string,
};
