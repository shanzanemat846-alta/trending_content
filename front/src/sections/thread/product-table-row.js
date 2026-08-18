import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from "@mui/material/Typography";
import CommentIcon from '@mui/icons-material/Comment';
import Tooltip from '@mui/material/Tooltip';
// utils
import { PLATFORMS, REDDIT_ENDPOINTS, VIDEO_DURATION } from 'src/utils/constants';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import RedditIcon from '@mui/icons-material/Reddit';
import YoutubeIcon from '@mui/icons-material/YouTube';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import React, { useState, useEffect } from "react";
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { SetThreadState } from 'src/app/lib/slices/thread-slice';

import ProductCommentsDrawer from './view-yt-captions-drawer';

import { ParseDuration, ParseDurationToMinutes } from '../../utils/helpers';

// ----------------------------------------------------------------------

export default function ProductTableRow({
  row,
  projectid,
  selected,
  onSelectRow,
  onDeleteRow,
  platform,
  onPreprompt
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const postPermalink = platform === PLATFORMS.REDDIT ? `https://reddit.com${row.url}` : row.url;
  const imageUrl = row.imageurl;


  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  const id = projectid;

  useEffect(() => {
    const fetchDataAndRedirect = async () => {
      if (url) {
        // Call the onPreprompt function with the URL and wait for its result
        const { postTitle, formattedText } = await onPreprompt(url);
        console.log("individual", postTitle, formattedText);

        localStorage.setItem("projectID", projectid);

        dispatch(SetThreadState({
          field: 'redditPrePromptDetails',
          value: {
            chatTitle: postTitle,
            chatPrePrompt: formattedText
          }
        }));

        dispatch(SetThreadState({ field: 'platformForContent', value: PLATFORMS.REDDIT }));

        router.push(paths.dashboard.post.root);
      }
    };

    // Execute the fetchDataAndRedirect function when the URL changes
    fetchDataAndRedirect();
  }, [url, onPreprompt, router]);

  const confirm = useBoolean();

  const popover = usePopover();

  const [viewComments, setViewComments] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [threadTitle, setThreadTitle] = useState('');

  const handleReviewComment = ({ threadId: threadIdVal, threadTitle: threadTitleValue }) => {
    setThreadId(threadIdVal);
    setThreadTitle(threadTitleValue);
    setViewComments(true);
  }

  const getIcon = () => {
    if (platform === PLATFORMS.REDDIT) return <RedditIcon  color="error" sx={{ width: 20, height: 20, mr: 2 }} />
    if (platform === PLATFORMS.YOUTUBE) return <YoutubeIcon color="error" sx={{ width: 20, height: 20, mr: 2 }} />

    return null;
  }
  useEffect(() => {
  const handleScroll = () => {
    setOpen(prev => {
      if (prev) return false;
      return prev;
    });
  };

  window.addEventListener('scroll', handleScroll, true);
  return () => window.removeEventListener('scroll', handleScroll, true);
}, []);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{paddingBlock:'0px'}} padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} disabled={
            platform === PLATFORMS.YOUTUBE ? ParseDurationToMinutes(row.duration) > VIDEO_DURATION : false
          } />
        </TableCell>

        <TableCell sx={{ display: 'flex', paddingBlock:'0px', paddingRight: '0px', minWidth: platform === PLATFORMS.REDDIT ? "255px" : '373px', alignItems: 'center' }}>
          {getIcon()}
            <Box display="flex" flexDirection="row" sx={{cursor: 'default' }}>
              {platform === PLATFORMS.YOUTUBE && imageUrl !== 'empty' && (
                <Box mr={2}>
                  <img src={imageUrl} alt="content" style={{ width: 40, height: 40 }} />
                </Box>
              )}
              <Tooltip
                 open={row.title?.length > 33 && open === row.title}
                  onOpen={() => {
                    if (row.title?.length > 33) setOpen(row.title);
                  }}
                  onClose={() => setOpen(null)}
                title={row.title?.length > 33 ? row.title : ''} arrow>
                <Typography
                  variant="p"
                  sx={{
                    position: 'relative',
                    textAlign:'left',
                  }}
                >
                {row.title?.length > 33 ? `${row.title?.slice(0,33)} ...` : row.title}
                </Typography>
            </Tooltip>

            </Box>
        </TableCell>

        <TableCell sx={{paddingBlock:'0px'}}>
          <ListItemText
            primary={
              <a
                href={postPermalink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'grey' }}
              >
                {platform === PLATFORMS.REDDIT ? "https://reddit.com/r/..." : "https://youtube.com/r..."}
              </a>
            }
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </TableCell>

        {
          platform === PLATFORMS.REDDIT && <TableCell sx={{ maxWidth: "60px", paddingBlock:'0px', typography: 'caption', color: 'text.secondary', paddingLeft: 3 }}>
            {imageUrl === 'empty' && <p>empty</p>}
            {imageUrl !== 'empty' && platform === PLATFORMS.REDDIT && (
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'grey' }}>
                https://i.reddit.it/...
              </a>
            )}
          </TableCell>
        }

        <TableCell sx={{paddingBlock:'0px'}} align="center">{platform === PLATFORMS.REDDIT ? row?.upvotes : row?.youtubeVideoDetails?.likeCount}</TableCell>
        {/* {platform!==PLATFORMS.REDDIT && <TableCell sx={{paddingBlock:'0px'}} align="center">{ row?.youtubeVideoDetails?.favoriteCount }</TableCell>} */}
        {platform !== PLATFORMS.REDDIT && <TableCell sx={{paddingBlock:'0px'}} align="center">{row?.youtubeVideoDetails?.viewCount}</TableCell>}

        <TableCell sx={{paddingBlock:'0px'}} align="center">{platform === PLATFORMS.REDDIT ? row?.comments : row?.youtubeVideoDetails?.comments}</TableCell>

        <TableCell sx={{paddingBlock:'0px', minWidth:'100px' }} >
          <ListItemText
            disableTypography
            primary={
              <Link noWrap color="inherit" variant="subtitle2">
                <Tooltip
                open={row.category?.length > 15 && open === row.category}
                  onOpen={() => {
                    if (row.category?.length > 15) setOpen(row.category);
                  }}
                  onClose={() => setOpen(null)}
                  title={row.category?.length > 15 ? row.category : ''} arrow>
                  <Typography
                    variant="p"
                    gutterBottom
                    sx={{
                      position: 'relative',
                      textAlign:'left',
                    }}
                  >
                  {row.category?.length > 15 ? `${row.category?.slice(0,15)} ...` : row.category}
                  </Typography>
                </Tooltip>

                {/* {row.category} */}
              </Link>
            }
            secondary={
              <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
                {row.mode}
              </Box>
            }
          />
        </TableCell>

        {
          platform === PLATFORMS.YOUTUBE ?
            <TableCell sx={{paddingBlock:'0px'}} align="center">{row.duration ? ParseDuration(row.duration) : '--'}</TableCell>
            : null
        }

        <TableCell sx={{paddingBlock:'0px'}} align="right">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {
              platform === PLATFORMS.YOUTUBE ?
                <>
                  <Tooltip
                  open={open === row.duration ? open : null}
                  onOpen={() => setOpen(row.duration)}
                  onClose={() => setOpen(null)}
                  title={
                    ParseDurationToMinutes(row.duration) > VIDEO_DURATION
                      ? "Video Duration is more than 20 minutes!"
                      : "View Captions and Comments"
                  }
                    placement="top"
                    arrow>
                    <span>
                      <IconButton
                        disabled={ParseDurationToMinutes(row.duration) > VIDEO_DURATION}
                        onClick={() => {
                          if (!(ParseDurationToMinutes(row.duration) > VIDEO_DURATION)) {
                            handleReviewComment({ threadId: row._id, threadTitle: row.title });
                          }
                        }}
                        sx={{
                          color: (ParseDurationToMinutes(row.duration) > VIDEO_DURATION) ? '#ccc' : '#6ea7db', // Grey out the icon when disabled
                          cursor: (ParseDurationToMinutes(row.duration) > VIDEO_DURATION) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <CommentIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </>
                : null
            }
            <IconButton
              color="error"
              onClick={confirm.onTrue}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </div>
        </TableCell>

      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />

      {
        viewComments && threadId ?
          <ProductCommentsDrawer
            projectId={projectid}
            open={viewComments}
            onClose={() => { setViewComments(false); setThreadId(null); setThreadTitle(''); }}
            threadId={threadId}
            threadTitle={threadTitle}
          />
          : null
      }
    </>
  );
}

ProductTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  projectid: PropTypes.string,
  onPreprompt: PropTypes.func
};
