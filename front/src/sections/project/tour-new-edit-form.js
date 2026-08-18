import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { isEmpty } from 'lodash';
// @mui

import LoadingButton from '@mui/lab/LoadingButton';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from "src/components/loading-screen";
import { CustomTooltip } from 'src/components/custom-tooltip';
import { useRouter } from 'src/routes/hooks';
import axios from "axios";
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';
import { SetThreadState } from 'src/app/lib/slices/thread-slice';
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { GetOpenAIModels } from 'src/app/lib/slices/open-ai-model-slice';

import { ValidateAIKey } from 'src/utils/helpers';

import { projectRoute, host } from "../../utils/APIRoutes";
// ----------------------------------------------------------------------

export default function TourNewEditForm({ currentTour }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { getOpenAIModelsLoading, openAIModelsList } = useAppSelector((state) => state.openAIModel);
  const [models, setModels] = useState([]);
  const [defaultModel, setDefaultModel] = useState(null);

  // const { user: { _id: userId } } = useAuthContext();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

    // token
  const { accessToken } = useAuthContext();

  const headers = {
    Authorization: `Bearer ${accessToken}` // Include the token in the Authorization header
  };

  const [projectHelperMessage, setProjectHelperMessage] = useState('');


  const NewTourSchema = Yup.object().shape({
    name: Yup.string().trim().required('Project Name is required'),
    destination: Yup.string().trim().required('Model type is required'),
    projectAIKey: Yup.string()
      .trim()
      .when('destination', (destinationLabel, schema) => {
        const selectedModel = models.find((model) => model.modelName === destinationLabel[0]);
        const isRequired = selectedModel && !selectedModel.isDefault;

        if (isRequired) setProjectHelperMessage('API Key is required for this model');
        else setProjectHelperMessage('');

        // Only require when needed; API validation happens on submit
        return isRequired ? schema.required('API Key is required') : schema;
      }),
  });



  const defaultValues = useMemo(() => {
    const defaultDestination = currentTour?.chatgpttype ||
      models.find((m) => m.isDefault)?.modelName || '';
    return {
      name: currentTour?.title || '',
      destination: defaultDestination,
      projectAIKey: currentTour?.projectAIKey || '',
    };
  }, [currentTour, models]);

  const methods = useForm({
    resolver: yupResolver(NewTourSchema),
    defaultValues,
    mode: 'onTouched', // Validate on blur
    reValidateMode: 'onChange',
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    setValue,
    setError
  } = methods;

  const destination = watch('destination');

  const [isAPIKeyHide, setIsAPIKeyHide] = useState(false);

  useEffect(() => {
    const selectedModel = models.find((model) => model.modelName === destination);
    const isRequired = selectedModel && !selectedModel.isDefault;

    setIsAPIKeyHide(!isRequired);
    setProjectHelperMessage(isRequired ? 'API Key is required for this model' : '');
  }, [destination, models]);


  useEffect(() => {
    const fetchModels = () => {
        dispatch(GetOpenAIModels());
    };
  
    fetchModels();
  }, []);

  useEffect(() => {
    const list = openAIModelsList || [];
    setModels(list);
    const defaultMod = list.find((model) => model.isDefault) || null;
    setDefaultModel(defaultMod);
    // If creating a new project, set the default destination to the API's default model
    if (!currentTour && defaultMod) {
      setValue('destination', defaultMod.modelName, { shouldValidate: true, shouldDirty: true });
    }
  }, [openAIModelsList, currentTour, setValue]);

  useEffect(() => {
    if (currentTour) {
      reset(defaultValues);
    }
  }, [currentTour, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const selectedModel = models.find((model) => model.modelName === data.destination);
      
      // Validate key against model if provided (both create and edit flows)
      if (data.projectAIKey) {
        const keyValidation = await ValidateAIKey({ aIKey: data.projectAIKey, modelName: selectedModel?.modelName });
        if (!keyValidation.valid) {
          const message = keyValidation.message || 'Invalid AI Key';
          setError('projectAIKey', { type: 'manual', message });
          return;
        }
      }
      
      const project = {
        title: data.name,
        chatgpttype: selectedModel?.modelName,
        projectAIKey: data.projectAIKey,
      };

      if (currentTour) {
        await axios.patch(`${host}/api/project/${currentTour._id}`, project);
        enqueueSnackbar('Project updated success!');
        router.push(paths.dashboard.tour.root);
      } else {
        const response = await axios.post(projectRoute, project,  { headers });
        const { errors: errorsData } = response.data;

        dispatch(SetThreadState({ field: 'selectedYoutubeThreadsList', value: [] }));
        dispatch(SetThreadState({ field: 'selectedRedditThreadsList', value: [] }));
        dispatch(SetThreadState({
          field: 'contentCreationFails',
          value: {
            errorMessage: null,
            platform: null
          }
        }));
        dispatch(SetThreadState({
          field: 'platformForContent',
          value: null
        }));
        enqueueSnackbar( errorsData || 'Project created successfully!', { variant: errorsData ? 'error' : 'success' });
        const { _id } = response.data?.project || {};
        if (!errorsData && _id) {
          router.push(paths.dashboard.tour.job.new(_id));
          localStorage.setItem('projectID', _id);
          const { project: newProject } = response.data;
          const projectsList = JSON.parse(localStorage.getItem('projects'));
          projectsList.push(newProject);
          localStorage.setItem("projects", JSON.stringify(projectsList));
        }
      }
      reset();
    } catch (error) {
      console.error(error);
    }
  });

    useEffect(() => {
    const updatedModels = models.map((model) => ({
      ...model,
      required: model.value !== defaultModel,
    }));
    setModels(updatedModels);
  }, [defaultModel]);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Project&rsquo;s title, chatGPT Model type
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          {getOpenAIModelsLoading ?
            <LoadingScreen
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 9999,
              }}
            />
            : null}
          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Project&rsquo;s title</Typography>
              <RHFTextField name="name" placeholder="Ex: Tarot Project..."
                helperText={errors.name ? errors.name.message : ""}
                error={!isEmpty(errors?.name?.message)}
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">ChatGPT Model Type</Typography>
             
              <RHFAutocomplete
                name="destination"
                placeholder="Model type"
                options={models.map((option) => option.modelName)}
                getOptionLabel={(option) => option}
                renderInput={(params) => {
                  const selectedModel = models.find(model => model.modelName === params.inputProps.value);
                  let statusText = '';

                  if (selectedModel) {
                    statusText = selectedModel.isDefault ? 'Free' : 'Paid';
                  }

                  return (
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.inputProps.value && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: selectedModel?.isDefault ? 'success.main' : 'red',
                                }}
                              >
                                {statusText}
                              </Typography>
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  );
                }}
                renderOption={(props, option) => {
                  const { modelName, isDefault } = models.find((m) => m.modelName === option) || {};
                  return (
                    <li {...props} key={modelName}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                        <span>{modelName}</span>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDefault ? 'success.main' : 'red',
                            ml: 1,
                          }}
                        >
                          {isDefault ? 'Free' : 'Paid'}
                        </Typography>
                      </Stack>
                    </li>
                  );
                }}
              />
            </Stack>

            {/* {userSubscriptionPlanDetails.subscriptionPlan === SUBSCRIPTION_PLANS.FREE || 
             !paidModel ?
              null
              : */}
          {!isAPIKeyHide && 
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Open AI Key
                <CustomTooltip
                  description="How to get your OpenAI API key"
                  listItems={[
                    "Go to platform.openai.com/account/api-keys",
                    "Log in with your OpenAI account",
                    'Click "Create new secret key" and copy it'
                  ]}
                />
              </Typography>
              <span style={{  fontSize: '0.75rem' }} >{projectHelperMessage}</span>
              <RHFTextField
                name="projectAIKey"
                autoComplete="off"
                placeholder="Enter Open AI Key"
                helperText={errors.projectAIKey ? errors.projectAIKey.message : ""}
                error={!isEmpty(errors?.projectAIKey?.message)}
              />
            </Stack>
             }
            {/* } */}
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
          {!currentTour ? 'Create Project' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

TourNewEditForm.propTypes = {
  currentTour: PropTypes.object,
};
