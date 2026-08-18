import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { useAppSelector } from "src/app/lib/hooks";
// routes
import { host } from 'src/utils/APIRoutes';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// components
import axios from "axios";
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFEditor,
  RHFUpload,
  RHFTextField,
} from 'src/components/hook-form';
//
import { HOST_API } from 'src/config-global';
import PostDetailsPreview from './post-details-preview';

import { MAX_CONTENT_IMAGES_COUNT, MAX_FILE_SIZE } from '../../utils/constants';
import { FormatFileSize, SplitText } from '../../utils/helpers';
// ----------------------------------------------------------------------

export default function PostNewEditForm({ currentPost }) {
  console.log("currentPost image", currentPost?.image);
  const { userSubscriptionPlanDetails } = useAppSelector((state) => state.subscription);
  
  const router = useRouter();

  const [imagesLoading, setImagesLoading] = useState(false);

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  // const [imaged, setImaged] = useState();

  // useEffect(() => {
  //   setImaged(currentPost?.image);
  // }, [setImaged, currentPost]);

  let imaged = currentPost?.image;

  console.log("imaged", imaged);

  const preview = useBoolean();

  const NewBlogSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    content: Yup.string().required('Content is required'),
    // coverUrl: Yup.mixed().nullable().required('Cover is required'),
  });

 
  

  const defaultValues = useMemo(
    () => ({
      title: currentPost?.title || '',
      content: currentPost?.content || '',
      coverUrl:
        currentPost?.image === 'empty'
          ? `${HOST_API}/api/file/${currentPost?._id}`
          : currentPost?.image,
    }),
    [currentPost]
  );


  console.log("currentPost, image", currentPost, imaged);
  

  const methods = useForm({
    resolver: yupResolver(NewBlogSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const values = watch();

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('coverUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

   const handleRemoveFile = useCallback(() => {
     setValue('coverUrl', null);
   }, [setValue]);

  useEffect(() => {
    if (currentPost) {
      reset(defaultValues);
    }
  }, [currentPost, defaultValues, reset]);

  const handleUpload = async (formData) => {
    try {
      const file = formData.get('file');

      if (file.size > MAX_FILE_SIZE) {
        const fileSize = FormatFileSize(MAX_FILE_SIZE);
        enqueueSnackbar(`File size exceeds ${fileSize}!`, { variant: 'error' });
        return false;
      }

      await axios.post(`${host}/api/file/${currentPost._id}`, formData);

      return true;
    } catch (error) {
      console.error(error);
      const { message } = error?.response?.data || {};
      if (message) {
        enqueueSnackbar(message, { variant: 'error' });
      }
      return false;
    }
  };

  const ExtractImageUrls = (htmlString) => {
    const base64ImageUrls = [];
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;

    let totalImages = 0;
    match = imgRegex.exec(htmlString);
    while (match !== null) {
      const imgUrl = match[1];
      totalImages += 1;
      if (imgUrl.startsWith("data:image")) {
        base64ImageUrls.push(imgUrl);
      }

      match = imgRegex.exec(htmlString);
    }

    return { base64ImageUrls, totalImages };
  };

  const Base64ToFile = ({ base64, filename }) => {
    const arr = base64.split(','); // Split the base64 string to get the MIME type and the actual base64 data
    const mime = arr[0].match(/:(.*?);/)[1]; // Extract the MIME type
    const bstr = atob(arr[1]); // Decode the base64 data
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n > 0) {
      n -= 1;
      u8arr[n] = bstr.charCodeAt(n); // Convert to byte array
    }

    return new File([u8arr], filename, { type: mime }); // Create a File object
  };

  const ReplaceImageTags = ({ dataContent, imagesLinks }) => {
    let imgCount = -1;

    const newHtmlString = dataContent.replace(/<img[^>]+src="([^">]+)"[^>]*>/g, (match, src) => {
      if (src.startsWith("data:image")) {
        imgCount += 1;
        return `<img src="${imagesLinks[imgCount]}" />`;
      }
      return match;
    });

    return newHtmlString;
  }

  const UploadImage = async ({ formData, formattedDate }) => {
    try {
      const response = await axios.post(
        `${host}/api/store/content-images/${currentPost._id}?&formattedDate=${formattedDate}`,
        formData
      );

      return response?.data?.data;
    } catch (error) {
      const { error: errMessage } = error?.response?.data || {};
      enqueueSnackbar(SplitText(errMessage), { variant: 'error' }); 

      throw error;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const projectid = localStorage.getItem("projectID");
      console.log("data.coverurl", data.coverUrl, currentPost?.image);
      let flag = true;

      if (data.coverUrl && typeof data.coverUrl !== 'string') {
        const formData = new FormData();
        formData.append('file', data.coverUrl);
        flag = await handleUpload(formData);
        imaged = 'empty';
      }
      console.log('onsubmit flag', flag);
      if (flag) {

        const { base64ImageUrls: imgUrls, totalImages} = ExtractImageUrls(data.content);

        if (totalImages > MAX_CONTENT_IMAGES_COUNT) {
          enqueueSnackbar('Per Content only 10 images are allowed to attach!', { variant: 'error' });
          return;
        }

        const imagesLinks = [];
  
        if (imgUrls.length) {
          await new Promise((res, reject) => {
            setImagesLoading(true);

            imgUrls.forEach(async (imgUrl, index) => {
              const formData = new FormData();
              const formattedDate = dayjs().valueOf();

              const regex = /^data:image\/([a-zA-Z0-9]+);base64,/;
              const match = imgUrl.match(regex);
              const extension = match?.[1] || 'jpeg';
              const filename = `${index + 1}-${formattedDate}.${extension}`;
  
              imagesLinks.push(`${HOST_API}/api/content-images/${currentPost._id}/${filename}`);

              const fileCreated = Base64ToFile({ base64: imgUrl, filename });

              formData.append('image', fileCreated);

              if (fileCreated.size > MAX_FILE_SIZE) {
                const fileSize = FormatFileSize(MAX_FILE_SIZE);
                enqueueSnackbar(`File size exceeds ${fileSize}!`, { variant: 'error' });
                reject(new Error(`File size exceeds ${fileSize}!`));
                return;
              }

              try {
                await UploadImage({
                  formData,
                  formattedDate
                });

                if (index === imgUrls.length - 1) {
                  res(true);
                }
              } catch (error) {
                reject(new Error('Image upload failed'));
              }
            });
          });
        }

        setImagesLoading(false);
        let newContentImage = data.content;

        if (imagesLinks.length) {
          newContentImage = ReplaceImageTags({ dataContent: data.content, imagesLinks });
        }

        const store = {
          projectid,
          title: data.title,
          content: newContentImage,
          image: imaged,
        };

        const response = await axios.patch(`${host}/api/store/${currentPost._id}`, store);
        const { errors } = response.data;

        enqueueSnackbar(errors || 'Content saved successfully!', { variant: errors ? 'error' : 'success' });

        if (!errors) router.push(paths.dashboard.tour.store.root(projectid));
      }

      console.info('DATA', data);
    } catch (error) {
      setImagesLoading(false);
      console.log('error in the upload image catch block: ', error);
    }
  });

  useEffect(() => {
    if (values.content) {
      const { base64ImageUrls: imgUrls, totalImages} = ExtractImageUrls(values.content);

      if (totalImages > MAX_CONTENT_IMAGES_COUNT) {
        enqueueSnackbar('Per Content only 10 images are allowed to attach!', { variant: 'error' });
        return;
      }

      let newContent = values.content;

      if (imgUrls.length) {
        imgUrls.forEach(async (imgUrl, index) => {
          const formData = new FormData();
          const formattedDate = dayjs().valueOf();
          const filename = `${index + 1}-${formattedDate}.jpeg`;
          
          const fileCreated = Base64ToFile({ base64: imgUrl, filename });

          formData.append('image', fileCreated);

          if (fileCreated.size > MAX_FILE_SIZE) {
            const fileSize = FormatFileSize(MAX_FILE_SIZE);
            enqueueSnackbar(`File size exceeds ${fileSize}!`, { variant: 'error' });

            newContent = newContent.replace(imgUrl, 'no-image');
            const imgTagRegex = /<img[^>]+src="no-image"[^>]*>/g;

            newContent = newContent.replace(imgTagRegex, '');
          }
        });

        setValue('content', newContent)
      }
    }
  }, [values.content, enqueueSnackbar, setValue]);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Title, Content, Featured Image
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="title" label="Title" />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Content</Typography>
              <RHFEditor simple name="content" />
              {/* <RHFTextField name="description" label="Description" multiline rows={50} /> */}
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Featured Image</Typography>
              <RHFUpload
                name="coverUrl"
                maxSize={MAX_FILE_SIZE}
                onDrop={handleDrop}
                onDelete={handleRemoveFile}
              />
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
          loading={isSubmitting || imagesLoading}
          disabled={userSubscriptionPlanDetails?.subscriptionPlan === 'free'}
          sx={{ ml: 2 }}
        >
          {!currentPost ? 'Create Post' : 'Save Changes'}
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

      <PostDetailsPreview
        title={values.title}
        content={values.content}
        description={values.description}
        coverUrl={
          typeof values.coverUrl === 'string' ? values.coverUrl : `${values.coverUrl?.preview}`
        }
        //
        open={preview.value}
        isValid={isValid}
        isSubmitting={isSubmitting}
        onClose={preview.onFalse}
        onSubmit={onSubmit}
      />
    </FormProvider>
  );
}

PostNewEditForm.propTypes = {
  currentPost: PropTypes.object,
};
