'use client'

import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Divider
} from '@mui/material'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 30) {
    return `${diffDays} days ago`
  } 
  if (diffDays <= 60) {
    return '1 month ago'
  } 
  return `${Math.floor(diffDays / 30)} months ago`
}

const formatLikeCount = (count) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export default function CommentDisplay({ comments }) {
  return (
    <Stack spacing={2} 
    >
      {comments.map((comment) => (
        <Card
          key={comment._id}
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40
                }}
              >
                {comment.author[1]?.toUpperCase() || 'U'}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="subtitle2"
                    component="span"
                    sx={{
                      fontWeight: 500,
                      color: 'text.primary',
                      '&:hover': { color: 'primary.main' },
                      cursor: 'pointer'
                    }}
                  >
                    {comment.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(comment.publishedAt)}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    mb: 1
                  }}
                  dangerouslySetInnerHTML={{ __html: comment.comment }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Like">
                    <IconButton size="small">
                      <ThumbUpOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary">
                    {formatLikeCount(comment.likeCount)}
                  </Typography>

                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}

