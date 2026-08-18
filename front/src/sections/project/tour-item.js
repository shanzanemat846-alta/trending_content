import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
// routes


// utils
import { fDateTime } from 'src/utils/format-time';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { host } from 'src/utils/APIRoutes';
import CustomModal from "src/components/modal/modal"

import axios from "axios";
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import SettingsIcon from '@mui/icons-material/Settings';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import RedditIcon from '@mui/icons-material/Reddit';
import BorderColorIcon from '@mui/icons-material/BorderColor';


// ----------------------------------------------------------------------

export default function TourItem({  tour,onGo, onView, onEdit, onDelete }) {
  const popover = usePopover();
  const router = useRouter();

  const {
    _id,
    title,
    date,
  } = tour || {};

  const [tableData, setTableData] = useState();
  const [contents, setContents] = useState();
  const [campaigns, setCampaigns] = useState();
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

useEffect(() => {
  if (_id) {
    const fetchTableData = async () => {
      try {
        const response = await axios.get(`${host}/api/campaign/getData?projectid=${_id}`);
        const [data] = response.data;
        setTableData(data.threads);
        setContents(data.stores);
        setCampaigns(data.campaigns);
      } catch (error) {
        console.error('Error fetching table data:', error);
      }
    };
  
     fetchTableData();
  }
}, [_id, setTableData]);


  const firstImage = tableData && tableData.find(thread => thread.imageurl !== "empty" )?.imageurl || "https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_4.jpg";

  const secondTable = tableData && tableData.filter((thread) => thread.imageurl !==firstImage);
  const secondImage = secondTable && secondTable.find(thread => thread.imageurl !== "empty" )?.imageurl || "https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_13.jpg";
  
  const renderImages = (
    <Stack
      spacing={0.5}
      direction="row"
      sx={{
        p: (theme) => theme.spacing(1.5, 1, 0, 1),
      }}
    >
      <Stack
        flexGrow={1}
        sx={{
          position: 'relative',
          // pr: 13
        }}
      >
        <Image
          onClick={() => {
            onView();
          }}
          alt="images[0]"
          src="/assets/SVG-TC.svg"
          sx={
            {
              cursor: 'pointer',
            }
          }
        />
      </Stack>
      <Stack spacing={0.5} />
    </Stack>
  );

  const renderTexts = (
    <Tooltip title={title.length > 25 ? title : null} placement="top">
    <ListItemText
      sx={{
        p: (theme) => theme.spacing(2.5, 2.5, 2, 2.5),
      }}
      primary={`Created date: ${fDateTime(date)}`}
      secondary={
        <Link  color="inherit" sx={{
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'none',
            },
            cursor: 'pointer'
          }} onClick={() => { onView();}}>
          <Typography variant="subtitle2" style={{ fontSize: '20px', height: '32px'}}>
          {title.length > 25 ? `${title.substring(0, 25)}...` : title}
          </Typography>
        </Link>
        
      }
      primaryTypographyProps={{
        typography: 'caption',
        color: 'text.disabled',
      }}
      secondaryTypographyProps={{
        mt: 1,
        noWrap: true,
        component: 'span',
        color: 'text.primary',
        typography: 'subtitle1',
      }}
    />
     </Tooltip>
  );

  const renderInfo = (
    <Stack
      spacing={1.5}
      sx={{
        position: 'relative',
        p: (theme) => theme.spacing(0, 2.5, 2.5, 2.5),
      }}
    >
      <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', bottom: 365, right: 4 }}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
      {[
        {
          label: `Campaigns (${campaigns?.length || 0})`,
          icon: <RedditIcon color="error" sx={{ color: 'error.main' }} />,
          onClick: () => {
            router.push(paths.dashboard.tour.job.root(_id));
            localStorage.setItem('projectID', _id);
            localStorage.setItem('campaignMode', 'Sub-reddit');
          } 
        },
        {
          label: `Threads (${tableData?.length || 0})`,
          icon: <AutoAwesomeMotionIcon sx={{ color: 'info.main' }} />,
          onClick: onView,
        },
        {
          label: `Contents (${contents?.length || 0})`,
          icon: <ArticleIcon sx={{ color: 'primary.main' }} />,
          onClick: () => {
            router.push(paths.dashboard.tour.store.root(_id));
            localStorage.setItem('projectID', _id);
            localStorage.setItem('campaignMode', 'Sub-reddit');
          },
        },
      ].map((item) => (
        <Stack
          key={item.label}
          spacing={1}
          direction="row"
          alignItems="center"
          sx={{ typography: 'body2', cursor: 'pointer' }}
          onClick={item.onClick}
        >
          {item.icon}
          {item.label}
        </Stack>
      ))}

      <Button 
      variant="contained" 
      // color="error" 
      onClick={() => { onGo();}} 
        sx={{ 
          // backgroundColor: 'rgb(246, 104, 181)',
          //   '&:hover': {
          //    backgroundColor: 'rgb(211, 72, 145)',
          //     }, 
              position: 'absolute', bottom: 20, right: 25 
              }}>
        START
      </Button>
    </Stack>
  );

  return (
    <>
      <Card
        // sx={{ width: 300 }}
      >
        {renderImages}

        {renderTexts}

        {renderInfo}
      </Card>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <SettingsIcon />
          Setting
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            // onGo();
            localStorage.setItem('projectID', _id);
            router.push(paths.dashboard.tour.job.root(_id));
          }}
        >
          <BorderColorIcon />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            setConfirmDeleteProject(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
      <CustomModal
        open={confirmDeleteProject}
        onClose={() => setConfirmDeleteProject(false)}
        onConfirm={() => {onDelete(); setConfirmDeleteProject(false); }}
        title="Delete Project"
        actions={
          <>
            <Button onClick={() => setConfirmDeleteProject(false)} variant="outlined">
              Cancel
            </Button>
            <Button onClick={() => {onDelete(); setConfirmDeleteProject(false);}} variant="contained" color="error">
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete project? This action cannot be undone.</p>
      </CustomModal>
    </>
  );
}

TourItem.propTypes = {
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
  tour: PropTypes.object,
  onGo: PropTypes.func,
};
