'use client'

import {
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  IconButton,
  Link,
  Tooltip
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';

export default function RedditThread({ thread }) {
  const sm = useMediaQuery("(max-width:767px)");
  const md = useMediaQuery("(min-width:768px)");

  const height = useMemo(() => {
    if (sm) return "calc(100svh - 250px)";
    if (md) return "calc(100lvh - 150px)";
    return 'calc(100lvh - 150px)';
  }, [sm, md]);

  return (
    <Box sx={{ mx: 'auto', height: { height }, overflow: 'auto' }}>
      {thread.title && <Tooltip title={thread?.title?.length > 120 ? thread.title : ''} arrow>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            position: 'relative',
            height: '2.8em', // Clamped height
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          <Link
            href={`https://reddit.com${thread.url}`}
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
      </Tooltip>}

      {
        isEmpty(thread.postBody) && <Alert severity="warning">This post might contains a media content, so no post body is available.</Alert>
      }
      {!isEmpty(thread.postBody) && (
        <>
          <Typography variant="h6" gutterBottom>
            Content
          </Typography>
          <Box
            sx={{
              backgroundColor: 'white',
              maxHeight: 'calc(100vh - 385px)',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              overflow: 'auto',
            }}
          >
            <Typography
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'inherit',
                margin: 0,
              }}
            >
              {thread.postBody}
            </Typography>
          </Box>
        </>
      )}


      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Comments
      </Typography>
      {thread.commentsBody.length === 0 ? <Card sx={{height:40, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {thread.commentsBody.length === 0 ? 'No Comments' : null}
      </Card> : null}
      <Box sx={{ height: thread.postBody ? 'auto' : 'calc(100vh -  342px)', overflow: 'auto' }}>
        <Stack spacing={2} >
          {(Array.isArray(thread?.commentsBody)) && thread?.commentsBody?.map((comment, index) => (
            <Card
              key={index}
              sx={{
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem'
                    }}
                  >
                    {comment.author[0]}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        component="span"
                        sx={{
                          fontWeight: 500,
                          color: 'text.primary'
                        }}
                      >
                        {comment.author}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {comment.comment}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <IconButton size="small">
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        {comment.ups}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

// "use client"

// import { Alert, Box, Typography, Card, CardContent, Avatar, Stack, IconButton, Link, Tooltip } from "@mui/material"
// import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
// import { isEmpty } from "lodash"

// export default function RedditThread({ thread }) {
//   return (
//     <Box
//       sx={{
//         maxWidth: "800px",
//         mx: "auto",
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         p: 2,
//         gap: 2,
//         overflow: "hidden", // Prevent outer scroll
//       }}
//     >
//       {/* Title Section */}
//       <Box sx={{ flexShrink: 0 }}>
//         {" "}
//         {/* Prevent title from shrinking */}
//         <Tooltip title={thread?.title?.length > 120 ? thread.title : ""} arrow>
//           <Typography
//             variant="h6"
//             gutterBottom
//             sx={{
//               display: "-webkit-box",
//               WebkitLineClamp: 3,
//               WebkitBoxOrient: "vertical",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               lineHeight: 1.3,
//               maxHeight: "4.2em",
//             }}
//           >
//             <Link
//               href={`https://reddit.com${thread.url}`}
//               color="inherit"
//               underline="hover"
//               target="_blank"
//               rel="noopener noreferrer"
//               sx={{
//                 color: "#393b3d",
//                 textDecoration: "none",
//                 "&:hover": {
//                   color: "#00A76F",
//                   textDecoration: "underline",
//                 },
//               }}
//             >
//               {thread.title}
//             </Link>
//           </Typography>
//         </Tooltip>
//       </Box>

//       {/* Content Section */}
//       <Box sx={{ flexShrink: 0 }}>
//         {" "}
//         {/* Prevent content from shrinking */}
//         {isEmpty(thread.postBody) ? (
//           <Alert severity="warning">This post might contains a media content, so no post body is available.</Alert>
//         ) : (
//           <>
//             <Typography variant="h6" gutterBottom>
//               Content
//             </Typography>
//             <Box
//               sx={{
//                 backgroundColor: "white",
//                 borderRadius: "8px",
//                 padding: "16px",
//                 boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//                 maxHeight: "30vh",
//                 overflow: "auto",
//               }}
//             >
//               <Typography
//                 component="pre"
//                 sx={{
//                   whiteSpace: "pre-wrap",
//                   fontFamily: "inherit",
//                   margin: 0,
//                 }}
//               >
//                 {thread.postBody}
//               </Typography>
//             </Box>
//           </>
//         )}
//       </Box>

//       {/* Comments Section */}
//       <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
//         Comments
//       </Typography>

//       <Box
//         sx={{
//           flex: 1, // Take remaining space
//           minHeight: 0, // Allow box to shrink
//           overflow: "auto", // Enable scroll for comments
//         }}
//       >
//         <Stack spacing={2}>
//           {thread.commentsBody.map((comment, index) => (
//             <Card
//               key={index}
//               sx={{
//                 bgcolor: "background.paper",
//                 "&:hover": {
//                   bgcolor: "action.hover",
//                 },
//               }}
//             >
//               <CardContent>
//                 <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
//                   <Avatar
//                     sx={{
//                       width: 32,
//                       height: 32,
//                       bgcolor: "primary.main",
//                       fontSize: "0.875rem",
//                     }}
//                   >
//                     {comment.author[0]}
//                   </Avatar>

//                   <Box sx={{ flexGrow: 1, minWidth: 0 }}>
//                     {" "}
//                     {/* Add minWidth: 0 to allow text to wrap */}
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
//                       <Typography
//                         variant="subtitle2"
//                         component="span"
//                         sx={{
//                           fontWeight: 500,
//                           color: "text.primary",
//                         }}
//                       >
//                         {comment.author}
//                       </Typography>
//                     </Box>
//                     <Typography
//                       variant="body2"
//                       color="text.primary"
//                       sx={{
//                         whiteSpace: "pre-wrap",
//                         wordBreak: "break-word", // Ensure long words break
//                       }}
//                     >
//                       {comment.comment}
//                     </Typography>
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
//                       <IconButton size="small">
//                         <ArrowUpwardIcon fontSize="small" />
//                       </IconButton>
//                       <Typography variant="caption" color="text.secondary">
//                         {comment.ups}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Box>
//               </CardContent>
//             </Card>
//           ))}
//         </Stack>
//       </Box>
//     </Box>
//   )
// }


