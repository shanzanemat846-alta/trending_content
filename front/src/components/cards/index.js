'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  Typography,
  IconButton,
  Checkbox,
  Stack,
  Button
} from '@mui/material';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { useBoolean } from 'src/hooks/use-boolean';

import { PLATFORMS, VIDEO_DURATION } from '../../utils/constants';
import ProductCommentsDrawer from '../../sections/thread/view-yt-captions-drawer';
import { ParseDuration, ParseDurationToMinutes, FormatNumberWithPostFix } from '../../utils/helpers';

const VideoCard = ({
  projectId,
  isChecked,
  onCheckChange,
  thumbnailUrl,
  title,
  platform,
  sourceURL,
  likes,
  views,
  comments,
  keyword,
  duration,
  imageURL,
  onCommentClick,
  onDeleteClick,
  youtubeIcon,
  _id
}) => {
  const confirmDeleteThread = useBoolean();
  const [viewComments, setViewComments] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [threadTitle, setThreadTitle] = useState('');

  const handleReviewComment = ({ threadId: threadIdVal, threadTitle: threadTitleValue }) => {
    setThreadId(threadIdVal);
    setThreadTitle(threadTitleValue);
    setViewComments(true);
  }

  return (
    <>
      <Box
        gap={2}
        padding="15px 12px 15px 0px"
        alignItems="flex-start"
        maxWidth={700}
        key={_id}
      >
        <Box display="flex" gap="12px">
          <Checkbox
            checked={isChecked}
            onChange={onCheckChange}
            sx={{ alignSelf: 'flex-start' }}
          />
          <Box>
            <Box display="flex" gap="12px">
              {youtubeIcon ? (
                <Box height={100} position="relative">
                  {thumbnailUrl ?
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail"
                      width={100}
                      height={80}
                      style={{ borderRadius: 8, objectFit: 'cover' }}
                    />
                    :
                    <Image
                      src={youtubeIcon}
                      alt="YouTube Icon"
                      width={30}
                      height={30}
                      style={{
                        borderRadius: 8,
                        position: 'absolute',
                        right: 0,
                        bottom: '20px',
                        objectFit: 'cover',
                      }}
                    />
                  }
                </Box>
              ) : (
                <Image
                  src="/assets/reddit-card-icon.svg"
                  alt="Thumbnail"
                  width={20}
                  height={20}
                />
              )}
              <Box flex={1}>
                <Typography mb={1} fontSize="12px" color="#000000" lineHeight="100%" fontWeight={400}>
                  {title}
                </Typography>
                <Link
                  style={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    display: 'block',
                    maxWidth: youtubeIcon ? 177 : 320,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={sourceURL}
                  passHref
                >
                  {sourceURL}
                </Link>
              </Box>
            </Box>

            {platform === PLATFORMS.REDDIT && imageURL && imageURL !== "empty" && (
              <Stack marginBlock="12px" direction="row" spacing="4px">
                <Typography fontSize={12} fontWeight={400} color="#A4A4A6">Images:</Typography>
                <Link
                  style={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    display: 'block',
                    maxWidth: 380,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  href={imageURL}
                  passHref
                >
                  {imageURL}
                </Link>
              </Stack>
            )}

            <Box display="grid" gap={2} gridTemplateColumns="1fr 1fr 1fr" alignItems="center">
              <Box display="flex" alignItems="center" gap={0.5}>
                <Image src="/assets/like-icon-1.svg" width={20} height={20} alt="Like Icon" />
                <Typography variant="body2">{FormatNumberWithPostFix(likes)}</Typography>
              </Box>
              {platform === PLATFORMS.YOUTUBE && <Box display="flex" alignItems="center" gap={0.5}>
                <Image src="/assets/eye-icon.svg" width={20} height={20} alt="Views Icon" />
                <Typography variant="body2">{FormatNumberWithPostFix(views)}</Typography>
              </Box>
              }
              <Box display="flex" alignItems="center" gap={0.5}>
                <Image src="/assets/comment-icon-1.svg" width={20} height={20} alt="Comments Icon" />
                <Typography variant="body2">{FormatNumberWithPostFix(comments)}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems={youtubeIcon ? 'end' : 'center'} justifyContent="space-between">
              <Box mt={1} display="flex" flexDirection="column" gap={1}>
                <Typography fontSize={12} fontWeight={400} color="#A4A4A6">
                  Category:
                  <Typography component="span" pl="4px" fontSize={12} fontWeight={400} color="#000000">
                    {keyword}
                  </Typography>
                </Typography>
                {platform === PLATFORMS.YOUTUBE && (
                  <Typography fontSize={12} fontWeight={400} color="#A4A4A6">
                    Duration:
                    <Typography component="span" pl="4px" fontSize={12} fontWeight={400} color="#000000">
                      {duration ? ParseDuration(duration) : '--'}
                    </Typography>
                  </Typography>
                )}
              </Box>
              <Box display="flex" gap={1}>
                {platform === PLATFORMS.YOUTUBE &&
                  <IconButton
                    sx={{
                      color: (ParseDurationToMinutes(duration) > VIDEO_DURATION) ? '#ccc' : '#6ea7db', // Grey out the icon when disabled
                      cursor: (ParseDurationToMinutes(duration) > VIDEO_DURATION) ? 'not-allowed' : 'pointer',
                    }}
                    // onClick={onCommentClick}

                    disabled={ParseDurationToMinutes(duration) > VIDEO_DURATION}
                    onClick={() => {
                      if (!(ParseDurationToMinutes(duration) > VIDEO_DURATION)) {
                        handleReviewComment({ threadId: _id, threadTitle: title });
                      }
                    }}

                  >
                    <Image src="/assets/comments-icon.svg" width={32} height={32} alt="icon" />
                  </IconButton>
                }
                <IconButton color="error" onClick={() => {
                  console.log('here the delete button:');
                  confirmDeleteThread.onTrue()
                }
                }>
                  <Image src="/assets/delete-bin.svg" width={32} height={32} alt="Delete Icon" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmDeleteThread.value}
        onClose={confirmDeleteThread.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={() => { onDeleteClick(_id); confirmDeleteThread.onFalse(); }}>
            Delete
          </Button>
        }
      />

      {
        viewComments && threadId ?
          <ProductCommentsDrawer
            projectId={projectId}
            open={viewComments}
            onClose={() => { setViewComments(false); setThreadId(null); setThreadTitle(''); }}
            threadId={threadId}
            threadTitle={threadTitle}
          />
          : null
      }
    </>
  )
}

export default VideoCard;
