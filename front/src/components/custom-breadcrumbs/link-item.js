import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
// routes
import { RouterLink } from 'src/routes/components';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function BreadcrumbsLink({ link, activeLast, disabled }) {
  const { name, href, icon } = link;

  const containerStyles = {
    typography: 'body2',
    alignItems: 'center',
    color: 'text.primary',
    display: 'inline-flex',
    maxWidth: '100%',
    ...(disabled &&
      !activeLast && {
        cursor: 'default',
        pointerEvents: 'none',
        color: 'text.disabled',
      }),
  };

  const textStyles = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    maxWidth: { xs: '200px', sm: 'auto' },
    display: 'block',
  };

  const renderContent = (
    <>
      {icon && (
        <Box
          component="span"
          sx={{
            mr: 1,
            display: 'inherit',
            '& svg': { width: 20, height: 20 },
          }}
        >
          {icon}
        </Box>
      )}

      <Box component="span" sx={textStyles}>
        {name}
      </Box>
    </>
  );

  if (href) {
    return (
      <Link component={RouterLink} href={href} sx={containerStyles}>
        <Typography sx={textStyles}>{renderContent}</Typography>
      </Link>
    );
  }

  return <Box sx={containerStyles}> {renderContent} </Box>;
}

BreadcrumbsLink.propTypes = {
  activeLast: PropTypes.bool,
  disabled: PropTypes.bool,
  link: PropTypes.shape({
    href: PropTypes.string,
    icon: PropTypes.node,
    name: PropTypes.string,
  }),
};
