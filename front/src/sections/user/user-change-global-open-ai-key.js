'use client';

import * as Yup from 'yup';
import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';

import { SetUserState, ResetNotify, UpdateUserDetail } from 'src/app/lib/slices/user-slice';

import { DEFAULT_GPT_MODEL, LOADING_SCREEN_STYLES } from 'src/utils/constants';

import { GetOpenAIModels } from 'src/app/lib/slices/open-ai-model-slice';

import { ValidateAIKey } from 'src/utils/helpers';
import { LoadingScreen } from 'src/components/loading-screen';

const UserChangeGlobalOpenAIKey = ({ currentUser }) => {
  const dispatch = useAppDispatch();

  const { userUpdated, updateUserLoading } = useAppSelector((state) => state.user);
  const { getOpenAIModelsLoading, openAIModelsList } = useAppSelector((state) => state.openAIModel);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [changeInProfile, setChangeInProfile] = useState(false);
  const [defaultModelName, setDefaultModelName] = useState(DEFAULT_GPT_MODEL);

  const { last4Digit } = currentUser?.globalOpenAI || {};

  const globalOpenAiKeySchema = Yup.object().shape({
    globalOpenAIKey: Yup.string().trim(),
  });

  const defaultValues = useMemo(
    () => ({
      globalOpenAIKey: '',
    }),
    [currentUser]
  );
  
  const methods = useForm({
    resolver: yupResolver(globalOpenAiKeySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setError,
  } = methods;

  const formValues = watch();

  useEffect(() => {
    dispatch(GetOpenAIModels());
  }, []);

  useEffect(() => {
    if (Array.isArray(openAIModelsList) && openAIModelsList.length) {
      const def = openAIModelsList.find((m) => m.isDefault);
      setDefaultModelName(def?.modelName || DEFAULT_GPT_MODEL);
    }
  }, [openAIModelsList]);

  const onSubmit = handleSubmit(async (data) => {
    if (isButtonDisabled) return;

    const key = data?.globalOpenAIKey?.trim();

    console.log('defaultModelName: ', defaultModelName);
    // If user provided a key, validate it via chat completions
    if (key) {
      const validation = await ValidateAIKey({ aIKey: key, modelName: defaultModelName });
      if (!validation.valid) {
        setError('globalOpenAIKey', { type: 'manual', message: validation.message || 'Invalid AI Key' });
        return;
      }
    }

    dispatch(UpdateUserDetail({ updateParams: data, userId: currentUser._id }));
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (userUpdated) {
      reset(defaultValues);
      dispatch(SetUserState({ field: 'userUpdated', value: false }));
      dispatch(ResetNotify({}));
    }
  }, [userUpdated]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Paper
        elevation={3}
        style={{
          padding: '16px',
          borderRadius: '8px',
        }}
      >
         {getOpenAIModelsLoading ? (
            <LoadingScreen
              sx={{
                ...LOADING_SCREEN_STYLES,
              }}
            />
          ) : null}
        <Grid
          container
          spacing={3}
          alignItems="center"
        >
          <Grid item xs={12} md={10} style={{ marginTop: '14px' }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
            >
              <Box sx={{ mt: 3 }}>
                <RHFTextField name="globalOpenAIKey" label="Global OpenAI Key" autoComplete="off" />
              { last4Digit &&
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
                Current Key: **** **** **** {last4Digit || ''}
              </Typography>
              }
              </Box>
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={updateUserLoading}
              >
                {!last4Digit ? 'Add Global AI Key' : 'Update Global AI Key'}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </FormProvider>
  );
};

export default UserChangeGlobalOpenAIKey;
 