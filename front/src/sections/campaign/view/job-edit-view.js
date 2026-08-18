'use client';

import PropTypes from 'prop-types';
// @mui

import Container from '@mui/material/Container';

// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
//

import JobNewEditForm from '../job-new-edit-form';

// ----------------------------------------------------------------------

export default function JobEditView({ id }) {
  const settings = useSettingsContext();

  const campaigns = JSON.parse(localStorage.getItem('campaign'));
  // console.log("campaigns", campaigns);

  const currentJob = campaigns.find((job) => job._id === id);
  // console.log("currentJob", currentJob);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Campaigns',
            href: paths.dashboard.tour.job.root(currentJob?.projectid),
          },
          { name: currentJob?.title },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <JobNewEditForm currentJob={currentJob} />
    </Container>
  );
}

JobEditView.propTypes = {
  id: PropTypes.string,
};
