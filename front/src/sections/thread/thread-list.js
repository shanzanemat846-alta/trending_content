import { List, ListItem, ListItemButton, ListItemText, ListItemIcon, IconButton, Tooltip, Typography, Box } from '@mui/material'
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete'
import SubtitlesIcon from '@mui/icons-material/Subtitles'
import SubtitlesOffIcon from '@mui/icons-material/SubtitlesOff'

import Iconify from 'src/components/iconify';
import RedditIcon from '@mui/icons-material/Reddit';
import YouTubeIcon from '@mui/icons-material/YouTube';

import { PLATFORMS } from 'src/utils/constants'; 

export default function ThreadList({ threads, selectedThreadId, onSelectThread, onDeleteThread }) {
  const truncateTitle = (title, maxLength) => {
    if (title.length <= maxLength) return title
    return `${title.substring(0, maxLength)}...`
  }

  const GetPlatformIcon = ({ platform }) => {
    if (platform === PLATFORMS.REDDIT) return <RedditIcon  color="error"/>
    if (platform === PLATFORMS.YOUTUBE) return <YouTubeIcon color="error" />

    return null;
  }

  const renderSubtitleIcon = (thread) => {
    if (thread.platform === PLATFORMS.YOUTUBE) {
      if (thread.captionTrackNotFound || thread.engCaptionsNotAvailable) {
        return <SubtitlesOffIcon color="error" sx={{ mr: 1 }} />;
      }
      return <SubtitlesIcon color="success" sx={{ mr: 1 }} />;
    }
    return null;
  };

  return (
    <List sx={{paddingBottom: '69px'}}>
      {threads.map((thread) => (
        <ListItem
          key={thread.threadId}
          disablePadding
          secondaryAction={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
               {renderSubtitleIcon(thread)}
              <IconButton
                edge="end"
                sx={{ color: 'red' }}
                aria-label="delete"
                onClick={() => onDeleteThread({ threadId: thread.threadId, platform: thread.platform } )}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Box>
          }
        >
          <ListItemButton 
            selected={thread.threadId === selectedThreadId}
            onClick={() => onSelectThread(thread.threadId)}
          >
            <Tooltip title={thread.title} placement="right">
              <Box>
              <Box display="flex" alignItems="center">
                {GetPlatformIcon({ platform: thread.platform })}
                <Typography variant="body2" noWrap sx={{ ml: 1 }}>
                  {truncateTitle(thread.title, 17)}
                </Typography>
              </Box>
              {thread.platform === PLATFORMS.YOUTUBE ? 
              <Typography variant="caption" color="text.secondary">
                {thread.captionTrackNotFound || thread.engCaptionsNotAvailable  ? "Captions not available" : "Captions available"}
              </Typography>
              : null}
            </Box>
            </Tooltip>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
