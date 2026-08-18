import React from 'react';
import { isEmpty } from 'lodash';
import {
  Box,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingScreen } from 'src/components/loading-screen';

const SummaryModal = ({ 
  open, 
  onClose,
  loading, 
  summary = "", 
  faqs = [], 
  subReddit = [], 
  threads = [] 
}) => {

const formatSummary = (summaryText) => {
  const headings = [
    "Core Idea",
    "Key Takeaways",
    "Contrasting Opinions",
    "Popular Phrases / Quotes"
  ];

  let formattedText = summaryText;
  
  // Replace headings with markdown-like syntax for easier splitting
  headings.forEach(heading => {
    formattedText = formattedText.replace(heading, `**${heading}**`);
  });

  // Split by lines and process each line
  return formattedText.split('\n').map((line, index) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      const headingText = line.replace(/\*\*/g, '');
      return (
        <Typography key={index} variant="h6" component="h2" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
          {headingText}
        </Typography>
      );
    }
    return (
      <Typography key={index} variant="body1" component="p" sx={{ mb: 1 }}>
        {line}
      </Typography>
    );
  });
};

return (
  <Dialog
    open={open}
    onClose={onClose}
    maxHeight='calc(100vh - 64px)'
    fullWidth
    overflow='auto'
    PaperProps={{
      sx: {
        borderRadius: 2,
      }
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{
        position: 'relative',
        bgcolor: '#02a770',
        p: 2,
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Centered Title */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
          SUMMARY
        </Typography>

        {/* Close Button - Absolutely Positioned Right */}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {loading 
          &&  
          <LoadingScreen
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 9999
            }}
          />
        }

        {/* Main Content */}
        <Box sx={{ p: 3 }}>
          {/* Summary Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Summary
            </Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {!loading && (
                  !isEmpty(summary) ? formatSummary(summary) : "No summary available"
                )}
              </Typography>
            </Paper>
          </Box>

          {/* Two Column Layout */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Sub-reddits Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Sub-reddits
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                <List dense disablePadding>
                  {subReddit.map((sub, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={`• r/${sub.replace(/^r\//, '')}`} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* FAQs Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                FAQs
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                <List dense disablePadding>
                  {faqs.map((faq, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`• ${faq}`}
                          // secondary={faq.answer || null}
                          primaryTypographyProps={{ variant: 'body2' }}
                          // secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      {idx < faqs.length - 1 && <Divider sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>

          {/* Thread Selection */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Select Threads for Summary
            </Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <List dense disablePadding>
                {threads.map((thread, idx) => (
                  // <ListItem 
                  //   key={idx} 
                  //   disablePadding
                  //   secondaryAction={
                  //     <Checkbox edge="end" />
                  //   }
                  //   sx={{ py: 1 }}
                  // >
                    <ListItemText 
                      primary={thread}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  // </ListItem>
                ))}
              </List>
            </Paper>
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'right' }}>
              Selected: {threads.length} threads
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Box>
  </Dialog>
);
}

export default SummaryModal;