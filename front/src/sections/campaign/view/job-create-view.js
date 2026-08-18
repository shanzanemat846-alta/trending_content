'use client';

// @mui
import Container from '@mui/material/Container';
// routes
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Stepper from 'src/components/stepper/stepper';
import { useHandleStepClick } from 'src/components/stepper/handle-step-click';
import { paths } from 'src/routes/paths';
//
import JobNewEditForm from '../job-new-edit-form';

// ----------------------------------------------------------------------

export default function JobCreateView({ id }) {
  const { handleStepClick } = useHandleStepClick();
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stepper activeStepNumber={1} handleStepClick={handleStepClick} />
      <CustomBreadcrumbs
        heading="Create a new campaign"
        links={[
          // {
          //   name: 'Dashboard',
          //   href: paths.dashboard.root,
          // },
          {
            name: 'Campaigns',
            href: paths.dashboard.tour.job.root(id),
          },
          { name: 'New campaign' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <JobNewEditForm />
    </Container>
  );
}
