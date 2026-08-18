'use client';

import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import moment from "moment";
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
// _mock
import { _socials } from 'src/_mock';
// utils
import { fNumber } from 'src/utils/format-number';
// components
import { LoadingScreen } from "src/components/loading-screen";
import Iconify from 'src/components/iconify';
import { USERS_ROLE } from 'src/utils/constants';

export default function ProfileHome({ info, posts, creditLoading }) {
  const renderCredits = (
    <Card sx={{ py: 3, textAlign: 'center', typography: 'h4' }}>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
      >
         {creditLoading ? <LoadingScreen /> :
         <>
          <Stack width={1}>
          {((info.totalCredits || 0) - (info.usedCredits || 0)).toFixed(2)}
            <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
              Available Credits
            </Box>
          </Stack>
          </>
        }
      </Stack>

    </Card>
  );

  const renderAbout = (
    <Card>
      <CardHeader title="About" />

      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack direction="row" sx={{ typography: 'body2' }}>
          <Iconify icon="fluent:mail-24-filled" width={24} sx={{ mr: 2 }} />
          {info.email}
        </Stack>

        { info.role === USERS_ROLE.USER &&
        <>
          <Stack direction="row" spacing={2}>
            <CardMembershipIcon />

            <Box sx={{ typography: 'body2' }}>
              Subscription {' '}
              <span style={{ fontWeight: 'bold' }}>
              {{
                  free: 'Free Plan',
                  starter: 'Starter Plan',
                  advanced: 'Advanced Plan',
                }[info.userSubscription] || 'Learn More'
              }
              </span>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Iconify icon="mdi:file-document-multiple-outline" width={24} />

            <Box sx={{ typography: 'body2' }}>
              You have generated {info.contentCount || 0 } pieces of content so far. Keep creating and explore more features!
            </Box>
          </Stack>
          </>
        }
      </Stack>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      {
        info.role === USERS_ROLE.USER && (
          <Grid xs={12} md={4}>
            <Stack spacing={3}>
              {renderCredits}
            </Stack>
          </Grid>
        )
      }
      
      <Grid xs={12} md={8} lg={info.role === USERS_ROLE.ADMIN && 12}>
        <Stack spacing={3}>
        {renderAbout}
        </Stack>
      </Grid>
    </Grid>
  );
}

ProfileHome.propTypes = {
  info: PropTypes.object,
  posts: PropTypes.array,
};
