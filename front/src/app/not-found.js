"use client"

import Link from "next/link"
import { styled } from "@mui/material/styles"
import { Typography, Button, Container, Box } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { PageNotFoundIllustration } from 'src/assets/illustrations';
import { varBounce } from 'src/components/animate';
import { useAuthContext } from 'src/auth/hooks';
import { USERS_ROLE } from 'src/utils/constants';
import { ADMIN_PATH_AFTER_LOGIN, PATH_AFTER_LOGIN } from 'src/config-global';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(2),
}))

const ErrorCode = styled(Typography)(({ theme }) => ({
  fontSize: "6rem",
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}))

export default function NotFound() {
  const { user } = useAuthContext();

  return (
    <StyledContainer maxWidth="sm">
        <PageNotFoundIllustration
          sx={{
            height: 260,
            my: { xs: 5, sm: 10 },
          }}
        />
      {/* </m.div> */}

      <Box mt={2} mb={5}>
        <Typography variant="body1" color="text.secondary" paragraph>
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If you think this is a mistake, Click on Home to go back.
        </Typography>
      </Box>

      <Button component={Link}
        href={user?.role === USERS_ROLE.ADMIN ? ADMIN_PATH_AFTER_LOGIN : PATH_AFTER_LOGIN}
        variant="contained" startIcon={<ArrowBackIcon />} size="large">
          Back to Home
      </Button>

    </StyledContainer>
  )
}
