"use client"

import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Grid,
  Divider,
  Modal,
  Card,
  Stack,
} from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch"
import moment from "moment";

import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium"
import CustomModal from "src/components/modal/modal"
import DiamondIcon from "@mui/icons-material/Diamond"

import { useAppDispatch } from "src/app/lib/hooks";

import { RemoveSubscription } from 'src/app/lib/slices/subscription-slice';

import { styled } from "@mui/system"
import useMediaQuery from "@mui/material/useMediaQuery";

// Styled components
const StyledCard = styled(Card)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },
})

const PlanIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
  "& svg": {
    fontSize: 32,
  },
}))

const UpgradeButton = styled(Button)({
  padding: "10px 24px",
  fontSize: "1rem",
  textTransform: "none",
  borderRadius: "8px",
})

const plans = [
  {
    title: "Free",
    price: 0,
    credits: "10 Free Credits",
    icon: RocketLaunchIcon,
    color: "#757575",
    bgColor: "#ffffff",
    features: [
      "Search",
      "Create",
      "Campaign Management",
      { text: "Store data", disabled: true },
      { text: "Export", disabled: true },
      { text: "GPT-4 Access", disabled: true },
    ],
  },
  {
    title: "Starter",
    price: 20,
    credits: "1500 Free Credits",
    popular: true,
    icon: WorkspacePremiumIcon,
    color: "#00a76f",
    bgColor: "#f6faf9",
    features: ["Search", "Create", "Campaign Management", "Store data", "Export", "Premium Prompts", "GPT-4 Access"],
  },
  {
    title: "Advanced",
    price: 60,
    credits: "5000 Free Credits",
    icon: DiamondIcon,
    color: "#2962ff",
    bgColor: "#f5f8ff",
    features: ["Search", "Create", "Campaign Management", "Store data", "Export", "GPT-4 Access", "Premium Prompts", "Team Features"],
  },
]

export default function PaymentDashboard({
  subscriptionPlan,
  subscriptionType,
  credits,
  handleUpgradePlan,
  billingAmount,
  // handleUnsubscribePlan,
  status,
  subscriptionDate,
  setModal,
  subscriptionId,
  freeCreditsDate
}) {
  console.log('\n\n subscription details: ', {
    subscriptionPlan,
    subscriptionType,
    credits,
  });

  const dispatch = useAppDispatch();
  const [isUnSubscribe, setIsUnSubscribe] = useState(false);
  const [nextAvailableDate, setNextAvailableDate] = useState(
    freeCreditsDate ?  moment().add(30, "days").toISOString() : moment()
  );

  const SUBSCRIPTION_TYPE = {
    MONTHLY: "monthly",
    YEARLY: "yearly"
  }

  const nextBillingDate = () => {
    if (!subscriptionDate || !subscriptionType) return null;

    if (subscriptionType === SUBSCRIPTION_TYPE.MONTHLY) {
      return moment(subscriptionDate).add(1, "month").format("YYYY-MM-DD");
    } if (subscriptionType === SUBSCRIPTION_TYPE.YEARLY) {
      return moment(subscriptionDate).add(1, "year").format("YYYY-MM-DD");
    }

    return null;
  };

  const handleUnsubscribePlan = (subscriptionIdValue) => {
    dispatch(RemoveSubscription({ subscriptionId: subscriptionIdValue }))
    .then(() => {
      setIsUnSubscribe(false);
    })
    .catch((error) => {
      console.error("Failed to remove subscription:", error);
    });
  }
  const isMobile = useMediaQuery("(max-width:899px)");


  return (
    <>
      <Box mb={2}>
        <Box display="flex" border="1px solid #ddd" boxShadow={1} p={2} borderRadius={1} width={isMobile ? '85vw' : 400} flexDirection="column" gap={0.5}>
          <Stack direction="row" justifyContent="center" alignItems="end" mb="16px">
            <Typography display="flex" margin={0} fontSize={24} color="#02a770" mb='6px' textTransform="capitalize" fontWeight={600}>{subscriptionPlan}</Typography>
            {subscriptionType && (
              <>
                <Typography fontSize={30}>/</Typography>
                <Typography margin={0} position="relative" top="-13px" fontSize={10} textTransform="capitalize" fontWeight={600}>
                  ${billingAmount} / {subscriptionType}
                </Typography>
              </>
            )}
          </Stack>
          <Stack direction="column" spacing={0.5} justifyContent="space-between">
          { nextBillingDate() && (
            <Stack direction="row" justifyContent="space-between"><Typography fontSize={14} textTransform="capitalize" fontWeight={600}>Next billing:</Typography><Typography fontSize={14} textTransform="capitalize" fontWeight={500}>{nextBillingDate()}</Typography></Stack>
          )}
            <Stack direction="row" justifyContent="space-between"><Typography fontSize={14} textTransform="capitalize" fontWeight={600}>Available Credits:</Typography><Typography fontSize={14} textTransform="capitalize" fontWeight={500}>{((credits?.total || 0) - (credits?.used || 0))?.toFixed(2)}</Typography></Stack>
          </Stack>
          {subscriptionPlan === 'free' && (
            <Stack style={{ marginTop: '15px' }} spacing={1}>
              <Typography type="body2" sx={{ fontSize: '0.85rem' }}>Next Free Credits Available On: <strong>{moment(nextAvailableDate).format("MM-DD-YYYY")}</strong></Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="center" alignItems="center" mt={1} gap={2}>
            {/* <Tooltip
             title={
              subscriptionPlan !== 'free'
                ? "You can't upgrade plan while you have an active subscription"
                : ""
            }
            > */}
            <Typography
              onClick={() => setModal(true)} fontSize={14} color="#02a770" textTransform="capitalize" sx={{ textDecoration: 'underline', cursor: 'pointer' }} fontWeight={600}>Upgrade Plan</Typography>
              {/* </Tooltip> */}
            {subscriptionPlan !== 'free' && (
                <Typography
                    onClick={() => setIsUnSubscribe(true)}
                    fontSize={14}
                    color="#000"
                    textTransform="capitalize"
                    sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                    fontWeight={600}
                >
                    Unsubscribe
                </Typography>
            )}
       </Stack>
        </Box>
      </Box>
      <CustomModal
        actions={
          <Stack direction="row" spacing={2}>
            <Button onClick={() => setIsUnSubscribe(false)} variant="outlined" color="error">Cancel</Button>
            <Button 
            onClick={() => handleUnsubscribePlan(subscriptionId)}
             variant="contained" color="error">Unsubscribe</Button>
          </Stack>
        }
        open={isUnSubscribe}
        title={
          <Stack direction="row" spacing={1}>
            <CreditCardIcon sx={{ color: 'red' }} />
            <Typography fontSize={16} fontWeight={600} color="red">Cancel Subscription</Typography>
          </Stack>}
      >
        <Box pt={2} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
          <WarningAmberIcon sx={{ fontSize: 65, color: 'red' }} />
          <Typography fontSize={18} fontWeight={600} textAlign="center">Are you sure you want to cancel this subscription</Typography>
        </Box>
      </CustomModal>
    </>
  )
}

