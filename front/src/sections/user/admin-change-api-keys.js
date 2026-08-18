'use client';

import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { SetUserState, ResetNotify, UpdateUserDetail } from 'src/app/lib/slices/user-slice';
import { ValidateAIKey } from 'src/utils/helpers';

const modelOptions = [
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    color: 'primary',
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    description: 'More capable, better reasoning',
    color: 'secondary',
  },
  {
    value: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    description: 'Faster and cheaper variant of GPT-4 with a 128K context window and improved performance.',
    color: 'secondary',
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Latest model with enhanced capabilities',
    color: 'success',
  }
];

const UserChangeOpenAIKeys = ({ 
   currentUser = {}
 }) => {
  const dispatch = useAppDispatch();
  const { userUpdated, updateUserLoading } = useAppSelector((state) => state.user);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);

  const defaultValues = {
    selectedModel: currentUser?.openAI?.model,
    openAIKey: currentUser?.openAI?.apiKey || '',
  };

  const validationSchema = Yup.object().shape({
    selectedModel: Yup.string().required('Model is required'),
    openAIKey: Yup.string()
      .required('API Key is required')
      .test('validate-ai-key', 'Invalid OpenAI API Key', async (value) => {
        if (!value) return false;
        try {
          const result = await ValidateAIKey({ aIKey: value, modelName: formValues.selectedModel });
          return result.valid;
        } catch (error) {
          return false;
        }
      }),
  });

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { watch, handleSubmit, reset, setValue, formState } = methods;
  const formValues = watch();

  const selectedModelInfo = modelOptions.find((option) => option.value === formValues.selectedModel);

  const handleKeyChange = async (event) => {
    const newKey = event.target.value;

    setValue('openAIKey', newKey, { shouldValidate: true });
    setKeyValidationError('');

    if (newKey.trim() === '') {
      setIsKeyValid(false);
      return;
    }

    setIsValidatingKey(true);
    try {
      const result = await ValidateAIKey({ aIKey: newKey, modelName: formValues.selectedModel });
      if (result.valid) {
        setIsKeyValid(true);
        setKeyValidationError('');
      } else {
        setIsKeyValid(false);
        setKeyValidationError(result.message);
      }
    } catch (error) {
      setIsKeyValid(false);
      setKeyValidationError('Error validating API Key');
    } finally {
      setIsValidatingKey(false);
    }
  };

  const onSubmit = async (data) => {
    const updatedOpenAIKeyDetails = {
      openAI: {
        model: data.selectedModel,
        apiKey: data.openAIKey
      }
    }
    dispatch(UpdateUserDetail({ updateParams: updatedOpenAIKeyDetails, userId: currentUser._id }));
  };

  const handleReset = () => {
    reset(defaultValues);
    setKeyValidationError('');
    setIsKeyValid(false);
    setIsKeyValid(!!defaultValues.openAIKey);
  };

  useEffect(() => {
    if (userUpdated) {
      dispatch(SetUserState({ field: 'userUpdated', value: false }));
      dispatch(ResetNotify({}));
    }
  }, [userUpdated]);

  useEffect(() => {
    if (userUpdated) {
      dispatch(SetUserState({ field: 'userUpdated', value: false }));
      dispatch(ResetNotify({}));
    }
  }, [userUpdated]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          marginBottom: '15px',
          // background: 'linear-gradient(135deg, #f5f7fa 0%, #e5e8ecff 100%)',
          // border: '1px solid',
          // borderColor: 'divider',
        }}
      >
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            OpenAI Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure your preferred OpenAI model and API key
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Model Selection */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '2px solid',
              borderColor: '#00A76F',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Select Model
              {selectedModelInfo && (
                <Chip label={selectedModelInfo.label} color={selectedModelInfo.color} size="small" variant="outlined" />
              )}
            </Typography>

            <Controller
              name="selectedModel"
              control={methods.control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="model-select-label">Choose Model *</InputLabel>
                  <Select
                    {...field}
                    labelId="model-select-label"
                    label="Choose Model *"
                    error={!!formState.errors.selectedModel}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  >
                    {modelOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {option.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {/* {selectedModelInfo && (
              <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Selected:</strong> {selectedModelInfo.description}
                </Typography>
              </Box>
            )} */}
          </Paper>

          {/* API Key Input */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '2px solid',
              borderColor: '#00A76F',
            }}
          >
            <Typography variant="h6" gutterBottom>
              API Key *
            </Typography>

            <RHFTextField
              name="openAIKey"
              label="OpenAI API Key *"
              placeholder="sk-..."
              type="text"
              onChange={handleKeyChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                sx: { fontFamily: 'monospace' },
              }}
            />

            {/* Validation Status */}
            {formValues.openAIKey && !isValidatingKey && (
              <Box mt={2}>
                {isKeyValid && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Valid API Key
                  </Alert>
                )}
                {!isKeyValid && keyValidationError && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {keyValidationError}
                  </Alert>
                )}
              </Box>
            )}

            <Box mt={2} p={2} bgcolor="#dfeded" borderRadius={1} sx={{ opacity: 0.8 }}>
              <Typography variant="caption" color="info.dark">
                💡 Your API key will be validated in real-time. Make sure it&apos;s a valid OpenAI API key.
              </Typography>
            </Box>
          </Paper>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
            }}
          >
            Reset to Default
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={updateUserLoading || isValidatingKey}
            disabled={!formState.isValid || !formState.isDirty}
            size="large"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            {isValidatingKey ? 'Validating...' : 'Update Configuration'}
          </LoadingButton>
        </Stack>

        {/* Debug Info
        <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
          <Typography variant="caption" color="text.secondary">
            <strong>Current Values:</strong> Model: {formValues.selectedModel}, Key:{' '}
            {formValues.openAIKey ? `${formValues.openAIKey.substring(0, 10)}...` : 'Not set'}
            <br />
            <strong>Valid:</strong> {isKeyValid ? 'Yes' : 'No'}, <strong>Changed:</strong>{' '}
            {formState.isDirty ? 'Yes' : 'No'}
          </Typography>
        </Box> */}
      </Paper>
    </FormProvider>
  );
};

export default UserChangeOpenAIKeys;
