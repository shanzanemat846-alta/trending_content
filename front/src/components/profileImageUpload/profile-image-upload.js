import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";

import {
  Avatar,
  Box,
  IconButton,
  Tooltip
} from "@mui/material";

import ClearIcon from '@mui/icons-material/Clear';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';

import { _mock } from "src/_mock";

const EditProfileImage = ({
  userProfileImageDetails,
  setChangeInProfile,
  setSelectedFile
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadDisable, setUploadDisable] = useState(true);

  useEffect(() => {
    if (
      !isEmpty(userProfileImageDetails.base64Image) &&
      !isEmpty(userProfileImageDetails.mimeType)
    ) {
      setImagePreview(
        `data:${userProfileImageDetails.mimeType};base64,${userProfileImageDetails.base64Image}`
      );
    }
    setSelectedFile(null);
    setUploadDisable(true);
  }, [userProfileImageDetails]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setUploadDisable(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    if (isEmpty(userProfileImageDetails.base64Image) && !isEmpty(imagePreview)) {
      setUploadDisable(true)
    } else if (!isEmpty(userProfileImageDetails.base64Image)) {
      setUploadDisable(false)
    }
    setImagePreview(null);
    setSelectedFile(null);
  };

  useEffect(() => {
    setChangeInProfile(!uploadDisable);
  }, [uploadDisable]);

  return (
    <Box display="flex" flexDirection="column" rowGap={2}>
      <Box
        sx={{
          position: "relative",
          width: 120,
          height: 120,
          margin: "0 auto",
        }}
      >
        <div style={{ position: 'relative' }}>
          <Avatar
            src={imagePreview || _mock.image.avatar(24)}
            alt="Profile"
            sx={{
              width: 100,
              height: 100,
              border: "2px solid #ddd",
            }}
          />
          <Tooltip title="Upload Picture">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                zIndex: 1,
                backgroundColor: "white",
                borderRadius: "50%",
                boxShadow: 3,
              }}
            >
              <input
                accept="image/*"
                type="file"
                style={{ display: "none" }}
                onClick={(e) => {
                  e.target.value = '';
                }}
                onChange={handleFileChange}
              />
              <EditIcon />
            </IconButton>
          </Tooltip>
        </div>

        {imagePreview && (
          <Tooltip title="Clear Picture">
            <IconButton
              color="error"
              size="small"
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "#fff",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
                boxShadow: 1,
              }}
              onClick={handleClearImage}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          padding: 1,
          border: "1px solid #ddd",
          borderRadius: 2,
          width: "80px",
          margin: "0 auto",
        }}
      >
        <Tooltip title="Upload Picture">
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="label"
          >
            <input
              accept="image/*"
              type="file"
              style={{ display: "none" }}
              onClick={(e) => {
                e.target.value = '';
              }}
              onChange={handleFileChange}
            />
            <PhotoCamera />
          </IconButton>
        </Tooltip>

      </Box>
    </Box>
  );
};

export default EditProfileImage;
