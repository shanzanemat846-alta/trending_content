import PropTypes from 'prop-types';
import * as Yup from 'yup';
import {  useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';

import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// components
import { useSnackbar } from 'src/components/snackbar';
import axios from "axios";
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';
import { promptRoute, host } from "../../utils/APIRoutes";


// ----------------------------------------------------------------------

export default function PostNewEditForm({ currentPost }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  // const preview = useBoolean();
  // token
  const { accessToken } = useAuthContext();

  const headers = {
      Authorization: `Bearer ${accessToken}` // Include the token in the Authorization header
    };

  const NewBlogSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentPost?.title || '',
      description: currentPost?.content || '',
    }),
    [currentPost]
  );

  const methods = useForm({
    resolver: yupResolver(NewBlogSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;


  useEffect(() => {
    if (currentPost) {
      reset(defaultValues);
    }
  }, [currentPost, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const prompt = { ...data, content: data.description}
      console.info('BolgDATA', data);
       if (currentPost) {
        await axios.patch(`${host}/api/prompt/${currentPost._id}`, prompt);
        enqueueSnackbar('Prompt updated success!');
        router.push(paths.dashboard.post.root);
      } else {
        const response = await axios.post(promptRoute, prompt,  { headers });
        const { errors } =response.data;
        enqueueSnackbar( errors || 'Prompt created success!', { variant: errors ? 'error' : 'success' });
        if(!errors) router.push(paths.dashboard.post.root);
      }
      reset();
      // preview.onFalse();
    
      
    } catch (error) {
      console.error(error);
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Prompt Title, Content
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="title" label="Prompt Title" />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Content</Typography>
              <RHFTextField name="description" label="Description" multiline rows={9} />
            </Stack>

          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>

        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentPost ? 'Create Prompt' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {/* {renderProperties} */}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

PostNewEditForm.propTypes = {
  currentPost: PropTypes.object,
};
