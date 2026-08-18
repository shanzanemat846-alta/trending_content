import PropTypes from 'prop-types';
import {  useEffect, useCallback } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
//
import { useCollapseNav } from './hooks';
import ChatNavItem from './chat-nav-item';
import ChatNavAccount from './chat-nav-account';
import { ChatNavItemSkeleton } from './chat-skeleton';

// ----------------------------------------------------------------------

const NAV_WIDTH = 320;

const NAV_COLLAPSE_WIDTH = 96;

export default function ChatNav({ loading,  conversations, selectedConversationId , projectid }) {
  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');

  const {
    collapseDesktop,
    onCloseDesktop,
    onCollapseDesktop,
    //
    openMobile,
    onOpenMobile,
    onCloseMobile,
  } = useCollapseNav();

  // const [searchContacts, setSearchContacts] = useState({
  //   query: '',
  //   results: [],
  // });

  useEffect(() => {
    if (!mdUp) {
      onCloseDesktop();
    }
  }, [onCloseDesktop, mdUp]);

  const handleToggleNav = useCallback(() => {
    if (mdUp) {
      onCollapseDesktop();
    } else {
      onCloseMobile();
    }
  }, [mdUp, onCloseMobile, onCollapseDesktop]);

  // const handleClickAwaySearch = useCallback(() => {
  //   setSearchContacts({
  //     query: '',
  //     results: [],
  //   });
  // }, []);

  const projectID = localStorage.getItem("projectID");

  // const handleClickResult = useCallback(
  //   (result) => {
  //     handleClickAwaySearch();

  //     router.push(`${paths.dashboard.tour.chatgpt(projectID)}?id=${result.id}`);
  //   },
  //   [handleClickAwaySearch, router, projectID]
  // );

  const renderToggleBtn = (
    <IconButton
      onClick={onOpenMobile}
      sx={{
        left: 0,
        top: 84,
        zIndex: 9,
        width: 32,
        height: 32,
        position: 'absolute',
        borderRadius: `0 12px 12px 0`,
        bgcolor: theme.palette.primary.main,
        boxShadow: theme.customShadows.primary,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          bgcolor: theme.palette.primary.darker,
        },
      }}
    >
      <Iconify width={16} icon="solar:users-group-rounded-bold" />
    </IconButton>
  );

  const renderSkeleton = (
    <>
      {[...Array(12)].map((_, index) => (
        <ChatNavItemSkeleton key={index} />
      ))}
    </>
  );
  

console.log("convestaions in chatNav ", conversations);
  const renderList = (
    <>
      {conversations?.map((chat) => (
        <ChatNavItem
          key={chat._id}
          collapse={collapseDesktop}
          conversation={chat}
          selected={chat._id === selectedConversationId}
          onCloseMobile={onCloseMobile}
          projectID = {projectid}
        />
      ))}
    </>
  );

  // const renderListResults = (
  //   <ChatNavSearchResults
  //     query={searchContacts.query}
  //     results={searchContacts.results}
  //     onClickResult={handleClickResult}
  //   />
  // );

  const renderContent = (
    <>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ p: 2.5, pb: 0 }}>
        {!collapseDesktop && (
          <>
            <ChatNavAccount />
            <Box sx={{ flexGrow: 1 }} />
          </>
        )}

        <IconButton onClick={handleToggleNav}>
          <Iconify
            icon={collapseDesktop ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
          />
        </IconButton>

        {/* {!collapseDesktop && (
          <IconButton onClick={handleClickCompose}>
            <Iconify width={24} icon="solar:user-plus-bold" />
          </IconButton>
        )} */}
      </Stack>

      <Box sx={{ p: 3.5, pt: 0 }}>{/* {!collapseDesktop && renderSearchInput} */}</Box>

      <Scrollbar sx={{ pb: 1 }}>
        {/* {searchContacts.query && renderListResults} */}

        {loading && renderSkeleton}

        {/* {!searchContacts.query && !!conversations.allIds.length && renderList} */}
        {renderList}
      </Scrollbar>
      {/* <Divider sx={{ mt: 1, mb: 1 }} /> */}
      <Button
        component={RouterLink}
        href={paths.dashboard.tour.store.root(projectID)}
        // variant="contained"
        variant="outlined"
        // sx={{ mb: 1 }}
      >
        Contents
      </Button>
      {/* <Divider sx={{ mb: 1 }} /> */}
      {/* <Typography
        variant="subtitle1"
        sx={{ mb: 2, pl: 1.2, color: 'text.secondary', variant: 'subtitle2' }}
      >
        Help
      </Typography> */}
      {/* <Button
        component={RouterLink}
        href='#'
        // variant="outlined"
        variant="contained"
        // sx={{
        //   width: 287, height: 80,
        //   mb: 2, ml: 2, fontSize: 18
        // }}
      >
        FAQ Widget
      </Button> */}
    </>
  );

  return (
    <>
      {!mdUp && renderToggleBtn}

      {mdUp ? (
        <Stack
          sx={{
            height: 1,
            flexShrink: 0,
            width: NAV_WIDTH,
            borderRight: `solid 1px ${theme.palette.divider}`,
            transition: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.shorter,
            }),
            ...(collapseDesktop && {
              width: NAV_COLLAPSE_WIDTH,
            }),
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openMobile}
          onClose={onCloseMobile}
          slotProps={{
            backdrop: { invisible: true },
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
          </Drawer>
      )}
    </>
  );
}

ChatNav.propTypes = {
  conversations: PropTypes.object,
  loading: PropTypes.bool,
  selectedConversationId: PropTypes.string,
  projectid: PropTypes.string,
};
