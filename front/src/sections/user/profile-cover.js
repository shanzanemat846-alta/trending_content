import PropTypes from 'prop-types';
// @mui
import {
  Avatar,
  Box,
  IconButton,
  Tooltip,
  Stack,
  Typography
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import ListItemText from '@mui/material/ListItemText';
import { useTheme, alpha } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
// theme
import { bgGradient } from 'src/theme/css';

import { _mock, _userAbout } from 'src/_mock';
// ----------------------------------------------------------------------

export default function ProfileCover({
  name,
  role,
  coverUrl,
  imagePreview,
  handleFileChange,
  handleClearImage,
  handleCoverChange,
  handleClearCover,
  handleEditUserDetails
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:899px)");
  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.primary.darker, 0.8),
          imgUrl: coverUrl || _userAbout.coverUrl,
        }),
        height: 1,
        color: 'common.white',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          ...bgGradient({
            color: alpha(theme.palette.primary.darker, 0.8),
            imgUrl: coverUrl,
          }),
          position: 'absolute',
          top: '7%',
          right: 3,
          transform: 'translateY(-50%)',
          padding: '4px',
          zIndex: 1,
        }}>

        <Tooltip title="Click to upload the cover image">
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="label"
            sx={{background: '#fff', "&:hover":{background: '#fff'}}}
          >
            <input
              accept=".jpg, .jpeg, .png"
              type="file"
              style={{ display: "none" }}
              onClick={(e) => {
                e.target.value = '';
              }}
              onChange={handleCoverChange}
            />

            <PhotoCamera sx={{ fontSize: 16, color: '#02a770' }} />
          </IconButton>
        </Tooltip>
        
        {coverUrl ?
          <Tooltip title="Click to remove the cover image">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
              onClick={handleClearCover}
              sx={{background: '#fff', marginLeft: '8px', "&:hover":{background: '#fff'}}}
            >
              <ClearIcon sx={{ fontSize: 16, color: 'red' }} />
            </IconButton>
          </Tooltip>
          : null}
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          left: { md: 24 },
          bottom: { md: 24 },
          zIndex: { md: 10 },
          pt: { xs: 6, md: 0 },
          position: { md: 'absolute' },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ position: "relative", width: 100, height: 100, margin: "0 auto" }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Avatar
                src={imagePreview || _mock.image.avatar(24)}
                alt="Profile"
                sx={{
                  width: '100%',
                  height: '100%',
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
                    top: '100%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(255, 255, 255, 255)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    padding: '4px',
                    zIndex: 1,
                  }}
                >
                  <input
                    accept=".jpg, .jpeg, .png"
                    type="file"
                    style={{ display: "none" }}
                    onClick={(e) => {
                      e.target.value = '';
                    }}
                    onChange={handleFileChange}
                  />

                  <PhotoCamera sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {imagePreview && (
                <Tooltip title="Clear Picture">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={handleClearImage}
                    sx={{
                      position: "absolute",
                      top: '10px',
                      right: '10px',
                      transform: 'translate(25%, -25%)',
                      backgroundColor: "#fff",
                      padding: '4px',
                      '&:hover': {
                        backgroundColor: "#f5f5f5",
                      },
                      boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <ClearIcon sx={{ fontSize: 14, color: 'red' }} />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </Box>
        </Box>

        <ListItemText
          sx={{
            ml: { md: 3 },
            display: 'flex',
            flexDirection: 'column',
            mt: { xs: 2, md: 0 },
            textAlign: { xs: 'center', md: 'unset' },
          }}
          primary={
            <Box display="flex" justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
              <Typography variant="h4">{name}</Typography>
             {isMobile && <Tooltip title="Click to edit the user details">
                <IconButton
                  onClick={handleEditUserDetails}
                  sx={{
                    background: '#fff',
                    marginLeft: '8px',
                    marginTop: '4px',
                    width: '27px',
                    height: '27px',
                    "&:hover": { background: '#fff' },
                  }}
                >
                  <EditIcon sx={{ fontSize: '16px', color: '#02a770' }} />
                </IconButton>
              </Tooltip>}
            </Box>
          }
          secondary={role}
          primaryTypographyProps={{
            typography: 'h4',
          }}
          secondaryTypographyProps={{
            color: 'inherit',
            component: 'span',
            typography: 'body2',
            sx: { opacity: 0.48 },
          }}
        />
        {!isMobile && <Tooltip title="Click to edit the user details">
          <IconButton
            sx={{background: '#fff', marginLeft: '8px', marginTop: '4px', width: '27px', height: '27px', "&:hover":{background: '#fff'}}}
          >
          <EditIcon sx={{fontSize: '16px', color: '#02a770'}} onClick={handleEditUserDetails} />
          </IconButton>
        </Tooltip>}
      </Stack>
    </Box>
  );
}

ProfileCover.propTypes = {
  coverUrl: PropTypes.string,
  name: PropTypes.string,
  role: PropTypes.string,
};
