import PropTypes from 'prop-types';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

import Container from '@mui/material/Container';
import SpeedDial from '@mui/material/SpeedDial';
import Tooltip from '@mui/material/Tooltip';

import ListItemText from '@mui/material/ListItemText';
import SpeedDialAction from '@mui/material/SpeedDialAction';
// _mock
import { _socials } from 'src/_mock';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// utils
import { fDate } from 'src/utils/format-time';
// theme
import { bgGradient } from 'src/theme/css';
// components
import Iconify from 'src/components/iconify';
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

export default function PostDetailsHero({ id, title, date, image }) {
  const theme = useTheme();

  const smUp = useResponsive('up', 'sm');

  // const image = localStorage.getItem("image");

  console.log('post details in hero image url', image);
  console.log('imageurl in this page', `${HOST_API}/api/file/${id}`);
  const [imaged, setImaged] = useState();
  const [tooltipOpen, setTooltipOpen] =  useState(false);

  useEffect(() => {
    setImaged(`${HOST_API}/api/file/${id}?${Date.now()}`);
  }, [setImaged, id]);

  return (
    <Box
      sx={{
        height: 480,
        overflow: 'hidden',
        ...bgGradient({
          imgUrl: image === 'empty' ? imaged : image,
          startColor: `${alpha(theme.palette.grey[900], 0.64)} 0%`,
          endColor: `${alpha(theme.palette.grey[900], 0.64)} 100%`,
        }),
      }}
    >
      <Container sx={{ height: 1, position: 'relative' }}>
        {/* <Typography
          variant="h3"
          component="h1"
          sx={{
            zIndex: 9,
            color: 'common.white',
            position: 'absolute',
            maxWidth: 480,
            pt: { xs: 2, md: 8 },
          }}
        >
          {title}
        </Typography> */}

        <Stack
          sx={{
            left: 0,
            width: 1,
            bottom: 0,
            position: 'absolute',
          }}
        >
          {date && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                px: { xs: 2, md: 3 },
                pb: { xs: 3, md: 8 },
              }}
            >
              {/* <Avatar
                alt={author.name}
                src={author.avatarUrl}
                sx={{ width: 64, height: 64, mr: 2 }}
              /> */}

              <ListItemText
                sx={{ color: 'common.white' }}
                // primary={author.name}
                secondary={fDate(date)}
                primaryTypographyProps={{ typography: 'subtitle1', mb: 0.5 }}
                secondaryTypographyProps={{
                  color: 'inherit',
                  sx: { opacity: 0.64 },
                }}
              />
            </Stack>
          )}
          <SpeedDial
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            direction={smUp ? 'left' : 'up'}
            ariaLabel="Share post"
            icon={
              <Tooltip
                title="Share feature is coming soon"
                placement="top"
                open={tooltipOpen}
              >
                <Iconify icon="solar:share-bold" />
              </Tooltip>
            }
            sx={{
              position: 'absolute',
              bottom: { xs: 32, md: 64 },
              right: { xs: 16, md: 24 },
            }}
          >
            {_socials.map((action) => (
              <SpeedDialAction
                onMouseEnter={()=> setTooltipOpen(false)}
                key={action.name}
                icon={<Iconify icon={action.icon} sx={{ color: action.color }} />}
                tooltipTitle={`${action.name} coming soon`}
                tooltipPlacement="top"
                FabProps={{ color: 'default' }}
              />
            ))}
          </SpeedDial>
        </Stack>
      </Container>
    </Box>
  );
}

PostDetailsHero.propTypes = {
  id: PropTypes.string,
  date: PropTypes.string,
  title: PropTypes.string,
  image: PropTypes.string,
};
