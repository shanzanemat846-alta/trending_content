import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Alert,
  Tooltip
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from '@mui/material/Link';
import moment from 'moment';

import { TableSelectedAction } from 'src/components/table';

import { DecodeHtmlEntities, FormatTime, FormatNumberWithSuffix } from '../../utils/helpers';

const formatDuration = (start, end) => `${FormatTime(start)} - ${FormatTime(end)}`

const columnWidths = {
  checkbox: '10px',
  author: '50px',
  comment: '400px',
  likeCount: '10px',
  publishedAt: '50px',
};

export default function ThreadContent({
  thread,
  selectedData,
  onSelectCaption,
  onSelectComment,
  onAllCaptionsSelect,
  onAllCommentsSelect
}) {
  const textRef = useRef(null);

  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    const { captions } = selectedData;

    if (captions === 'all') {
      setRowCount(thread?.captions?.length || 0)
    } else {
      setRowCount(selectedData?.captions?.length || 0)
    }
  }, [selectedData, thread]);

  const captionsBox = () => {
    if (thread.captionTrackNotFound) {
      return <Alert severity="warning">Captions are not available for this video.</Alert>
    }
    if (thread.engCaptionsNotAvailable) {
      return <Alert severity="warning">English captions are not available for this video.</Alert>
    }

    return (
      <TableContainer
        component={Paper}
        sx={{
          height:400,
        }}
      >
        <TableSelectedAction
          dense={rowCount}
          numSelected={rowCount}
          rowCount={rowCount}
          onSelectAllRows={(checked) => onAllCaptionsSelect({ threadId: thread.threadId, checked })}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        />
        <Table size="small">
          <TableHead
            sx={{
              position: 'sticky',
              top: (rowCount ? '38px' : 0),
              zIndex: 10
            }}
          >
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedData.captions !== 'all' && selectedData?.captions?.length > 0}
                  checked={selectedData.captions === 'all'}
                  onChange={(e) => onAllCaptionsSelect({ threadId: thread.threadId, checked: e.target.checked })}
                />
              </TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Transcription</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {thread.captions?.map((caption) => (
              <TableRow key={caption.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedData.captions === 'all' || (Array.isArray(selectedData.captions) && selectedData.captions.includes(caption.id))}
                    onChange={(e) => onSelectCaption({
                      threadId: thread.threadId,
                      captionId: caption.id,
                      checked: e.target.checked
                    })}
                  />
                </TableCell>
                <TableCell sx={{whiteSpace: isTab ? 'nowrap' :'wrap'}}>{formatDuration(caption.start, caption.end)}</TableCell>
                <TableCell sx={{whiteSpace: isTab ? 'nowrap' :'wrap'}}>{caption.transcription}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )

  };
  const isMobile = useMediaQuery("(max-width:767px)");
  const isTab = useMediaQuery("(max-width:899px)");

  return (
    <Box sx={{ marginTop: '0px', height: isMobile ? 'auto' : 'calc(100lvh - 140px)',
        overflow: 'auto', width:'100%'}}>
      <Tooltip title={thread?.title?.length > 120 ? thread.title : ''} arrow>
        <Typography
          ref={textRef}
          variant="h6"
          gutterBottom
          sx={{
            position: 'relative',
            height: '2.8em', // Clamped height
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
            marginBottom: {xs: '8px !important', sm: 0}
          }}
        >
          <Link
            href={thread.url}
            color="inherit"
            underline="hover"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#393b3d', // Normal state color
              textDecoration: 'none',
              '&:hover': {
                color: '#00A76F', // Hover state color
                textDecoration: 'underline', // Optional hover effect
              },
            }}
          >
            {thread.title}
          </Link>
        </Typography>
      </Tooltip>

      <Typography variant="h6" gutterBottom>Captions</Typography>
      {captionsBox()}

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Comments</Typography>
      <TableContainer
        component={Paper}
        sx={{ height: 400,
        }}
      >
        <TableSelectedAction
          dense={selectedData?.comments?.length}
          numSelected={selectedData?.comments?.length}
          rowCount={selectedData?.comments?.length}
          onSelectAllRows={(checked) => onAllCommentsSelect({ checked, threadId: thread.threadId })}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        />
        <Table size="small">

          <TableHead
            sx={{
              position: 'sticky',
              top: (selectedData?.comments?.length ? '38px' : 0),
              zIndex: 10
            }}
          >
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: columnWidths.checkbox }}>
                <Checkbox
                  indeterminate={selectedData?.comments?.length > 0 && selectedData?.comments?.length < thread.comments.length}
                  checked={selectedData.comments?.length === thread.comments?.length}
                  onChange={(e) => onAllCommentsSelect({ checked: e.target.checked, threadId: thread.threadId })}
                />
              </TableCell>
              <TableCell sx={{ width: columnWidths.author, whiteSpace: isTab ? 'nowrap' :'wrap' }}>Author</TableCell>
              <TableCell sx={{ width: columnWidths.comment, whiteSpace: isTab ? 'nowrap' :'wrap' }}>Comment</TableCell>
              <TableCell sx={{ width: columnWidths.likeCount, whiteSpace:'nowrap' }}>Like Count</TableCell>
              <TableCell sx={{ width: columnWidths.publishedAt, whiteSpace:'nowrap' }}>Published At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {thread.comments?.map((comment) => (
              <TableRow key={comment._id} hover>
                <TableCell padding="checkbox" sx={{ width: columnWidths.checkbox }}>
                  <Checkbox
                    checked={selectedData.comments.includes(comment._id)}
                    onChange={(e) => onSelectComment({ checked: e.target.checked, threadId: thread.threadId, commentId: comment._id })}
                  />
                </TableCell>
                <TableCell sx={{ width: columnWidths.author, whiteSpace: isTab ? 'nowrap' :'wrap' }} >{comment.author ? comment.author.slice(1) : '--'}</TableCell>
                <TableCell sx={{ width: columnWidths.comment, whiteSpace: isTab ? 'nowrap' :'wrap' }}>{comment.comment ? DecodeHtmlEntities(comment.comment) : '--'}</TableCell>
                <TableCell sx={{ width: columnWidths.likeCount, whiteSpace: 'nowrap' }}>{comment.likeCount ? FormatNumberWithSuffix(comment.likeCount) : '--'}</TableCell>
                <TableCell sx={{ width: columnWidths.publishedAt, whiteSpace: 'nowrap' }}>{comment.publishedAt ? moment(comment.publishedAt).format('MM-DD-YYYY') : '--'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
