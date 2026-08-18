'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Stepper from 'src/components/stepper/stepper';
import { useHandleStepClick } from 'src/components/stepper/handle-step-click';
//
import TourNewEditForm from '../tour-new-edit-form';

// ----------------------------------------------------------------------

export default function TourCreateView() {
  const settings = useSettingsContext();

  const { handleStepClick } = useHandleStepClick();
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stepper activeStepNumber={0} handleStepClick={handleStepClick} />
      <CustomBreadcrumbs
        heading="Create a new project"
        links={[
          {
            name: 'Projects',
            href: paths.dashboard.tour.root,
          },
          { name: 'New project' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TourNewEditForm />
    </Container>
  );
}
