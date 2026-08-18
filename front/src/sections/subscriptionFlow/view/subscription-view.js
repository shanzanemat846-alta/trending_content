'use client';

import { useState, useEffect } from "react";
import { initializePaddle } from '@paddle/paddle-js';
import Container from '@mui/material/Container';
import { isEmpty } from 'lodash';

import { useAuthContext } from 'src/auth/hooks';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';

import { Box, Divider, TextField, Modal, Typography, Tooltip, Button } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import { PRICE_PER_TOKEN, SUBSCRIPTION_PRICE_IDS } from "src/utils/constants";

import SubscriptionContainer from '../subscription-container';

export default function SubscriptionView() {
  const { user: { _id: userId, email } } = useAuthContext();

  const settings = useSettingsContext();
  const [purchaseToken, setPurchaseToken] = useState(false);
  const [tokens, setTokens] = useState("");
  const [paddle, setPaddle] = useState(null);

  const calculatePrice = (token) => token ? (Number(token) * PRICE_PER_TOKEN).toFixed(2) : "0.00";

  const price = calculatePrice(tokens)

  const handlePurchaseToken = async () => {
    if (!paddle) {
      console.error("Paddle is not initialized");
      return;
    }

    const getSuccessUrl = () => `${process.env.NEXT_PUBLIC_HOST_API}/dashboard/user`;

    paddle.Checkout.open({
      settings: {
        allowLogout: false,
        showAddDiscounts: false,
        successUrl: getSuccessUrl(),
      },
      items: [{ priceId: SUBSCRIPTION_PRICE_IDS.PURCHASED_TOKEN, quantity: Number(tokens) }],
      customer: {
        email,
      },
      customData: {
        purchaseTokens: tokens,
        userId
      },
    });
  };

  const isDisabledTooltip = () => {
    if (!tokens) return 'Please enter number of tokens';
    if (tokens < 10) return 'Minimum 10 tokens required';
    if (tokens > 1000) return 'Maximum 1000 tokens allowed';
    if (!Number.isInteger(Number(tokens))) return 'Tokens must be an absolute number';
    return '';
  }

  useEffect(() => {
    initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      eventCallback: (data) => {
        if (data.name === "checkout.completed") {
          setPurchaseToken(false);
          setTokens("");
        }
      }
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    }).catch((error) => {
      console.error("Failed to initialize Paddle:", error);
    });
  }, []);
  const isMobile = useMediaQuery("(max-width:899px)");

  return (
    <Container
      sx={{
        height: isMobile ? 'auto' : 'calc(100dvh - 300px)',
        overflowY: 'auto',
      }}
      maxWidth={settings.themeStretch ? false : 'lg'}
    >
      <Box display="flex" alignItems="flex-start" gap={1} justifyContent="space-between">
        <CustomBreadcrumbs
          heading="Subscription Details"
          links={[{ name: 'Payment' }]}
          sx={{ mb: 1 }}
        />
        <Button onClick={() => {
          setPurchaseToken(true);
          setTokens("");
        }} variant="contained" color="primary">
          Purchase Token
        </Button>

        <Modal open={purchaseToken} onClose={() => setPurchaseToken(false)}>
          <Box bgcolor="#fff" maxWidth={500} p={2} borderRadius={1} margin="auto" position="absolute" top="0" height={350} left="0" right="0" bottom="0">
            <Typography fontSize={20} fontWeight={600} pb={2}>
              Buy Extra Credits
            </Typography>
            <Divider />
            <Box my={2}>
              <Typography>Purchase Tokens</Typography>
              <TextField
                label="Enter Number of Tokens"
                variant="outlined"
                fullWidth
                type="number"
                margin="dense"
                value={tokens}
                onChange={(e) => setTokens(e.target.value)}
                error={!isEmpty(tokens) && !!isDisabledTooltip()}
                helperText={isDisabledTooltip()}
              />
              <Box>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Price: ${price}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "gray" }}>
                  Each token costs ${PRICE_PER_TOKEN.toFixed(2)}.
                </Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end" gap={2} mt={5}>
                <Button onClick={() => setPurchaseToken(false)} variant="outlined">
                  Cancel
                </Button>
                <Tooltip title={isDisabledTooltip()}>
                  <span>
                    <Button onClick={handlePurchaseToken} variant="contained" color="primary" disabled={!!isDisabledTooltip()}>
                      Confirm Purchase
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Modal>
      </Box>
      <SubscriptionContainer />
    </Container>
  );
}
