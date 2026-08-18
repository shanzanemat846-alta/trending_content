"use client"

import { useState } from "react"
import { startCase } from "lodash"
import {
  Box,
  Typography,
  Paper,
  Button,
  Modal,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Stack,
  // styled,
  IconButton
} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch"
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium"
import DiamondIcon from "@mui/icons-material/Diamond"

import { styled } from "@mui/system"

import CustomModal from "src/components/modal/modal"

import { PLANS_AND_CREDITS, PLAN_PRICING } from "../../utils/constants";

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
    value: "free",
    monthlyPrice: PLAN_PRICING.FREE_MONTHLY,
    yearlyPrice: PLAN_PRICING.FREE_YEARLY,
    credits: `${PLANS_AND_CREDITS.free} Free Credits`,
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
      { text: "Premium Prompts", disabled: true },
      { text: "No Refresh", disabled: true },
      { text: "Support", disabled: true }
    ],
  },
  {
    title: "Starter",
    value: "starter",
    monthlyPrice: PLAN_PRICING.STARTER_MONTHLY,
    yearlyPrice: PLAN_PRICING.STARTER_YEARLY,
    credits: "1500 Free Credits",
    monthlyEarnedCredits: `${PLANS_AND_CREDITS.starter.monthlyEarnedCredits} Earned Credits`,
    yearlyEarnedCredits: `${PLANS_AND_CREDITS.starter.yearlyEarnedCredits} Earned Credits`,
    popular: true,
    icon: WorkspacePremiumIcon,
    color: "#00a76f",
    bgColor: "#f6faf9",
    features: ["Search", "Create", "Campaign Management", "Store data", "Export", "GPT-4 Access", "Premium Prompts", "No Refresh", "Support"],
  },
  {
    title: "Advanced",
    value: "advanced",
    monthlyPrice: PLAN_PRICING.ADVANCED_MONTHLY,
    yearlyPrice: PLAN_PRICING.ADVANCED_YEARLY,
    credits: "5000 Free Credits",
    monthlyEarnedCredits: `${PLANS_AND_CREDITS.advanced.monthlyEarnedCredits} Earned Credits`,
    yearlyEarnedCredits: `${PLANS_AND_CREDITS.advanced.yearlyEarnedCredits} Earned Credits`,
    icon: DiamondIcon,
    color: "#2962ff",
    bgColor: "#f5f8ff",
    features: ["Search", "Create", "Campaign Management", "Store data", "Export", "GPT-4 Access", "Support", "Premium Prompts", "No Refresh", "Team Features"],
  },
]

export default function SubscriptionModal({
  open,
  setOpen,
  yearly,
  setYearly,
  handlePlanSelection,
  subscriptionPlan,
  subscriptionType,
  handleClose,
  handleUpdatePaddleSubscriptionPlan
}) {
  const getPricingSuffix = ({ value }) => {
    console.log('value here the value: ', value, 'yearly: ', yearly);

    if (value === 'free') return '/forever';
    if ((value === 'starter' || value === 'advanced') && !yearly) return '/monthly';
    if ((value === 'starter' || value === 'advanced') && yearly) return '/yearly';

    return '';
  };

  const isPaidPlanSubscribed = subscriptionPlan && subscriptionPlan !== "free"

  const isButtonDisabled = (planValue) => {
    if (isPaidPlanSubscribed && subscriptionPlan === planValue &&
      ((yearly && subscriptionType === "yearly") || (!yearly && subscriptionType === "monthly"))
    ) {
      return true
    }
    return false;
  }

  const getPlanLabel = (plan) => {
    if (
      subscriptionPlan === plan.value &&
      ((yearly && subscriptionType === "yearly") || (!yearly && subscriptionType === "monthly"))
    ) {
      return "Current Plan";
    }
    if (plan.monthlyPrice === 0 && subscriptionPlan === 'free') {
      return "Current Plan";
    }
    return `Choose ${plan.title}`;
  };

  const [updateSubscription, setUpdateSubscription] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({
    planValue: null,
    planPrice: 0
  });

  const handleChangeSubScription = ({planValue, planPrice}) => {
    if (!isPaidPlanSubscribed) {
      handlePlanSelection(planValue)
    } else {
      setUpdateSubscription(true);
      setCurrentPlan({
        planValue,
        planPrice
      });
    }
  };

  return (
    <>
      <Box sx={{ textAlign: "center" }}>
        {/* <Typography variant="h4" color="text.secondary">
          Choose the perfect plan for your needs
        </Typography> */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box />
          <Typography variant="h4" color="text.secondary">
            Choose the perfect plan for your needs
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ position: 'relative' }}>
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Typography variant="overline">MONTHLY</Typography>

            <Switch checked={yearly} sx={{ mx: 1 }} onChange={(e) => setYearly(e.target.checked)} />

            <Box sx={{ position: 'relative' }}>
              <Typography variant="overline">YEARLY</Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
      <Grid container spacing={4}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.title}>

            <StyledCard elevation={plan.popular ? 12 : 4} sx={{ bgcolor: plan.bgColor, display: "flex", flexDirection: "column" }}>
              {plan.popular && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    bgcolor: "#00a76f",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                  }}
                >
                  Most Popular
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1, p: 4, display: "flex", flexDirection: "column" }}>
                <PlanIcon sx={{ bgcolor: `${plan.color}15`, color: plan.color }}>
                  <plan.icon />
                </PlanIcon>
                <Typography variant="h5" gutterBottom>
                  {plan.title}
                </Typography>
                <Typography variant="h6" component="div">
                  ${yearly ? (plan.yearlyPrice) : plan.monthlyPrice}
                  <Typography variant="subtitle1" component="span" sx={{ ml: 1, color: "text.secondary" }}>
                    {
                      getPricingSuffix({ value: plan.value })
                    }
                  </Typography>
                </Typography>
                <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 1, fontWeight: 500 }}>
                  {plan.credits}
                </Typography>
                {plan.value !== 'free' &&
                  <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 1, fontWeight: 500 }}>
                    {(
                      !yearly ? plan.monthlyEarnedCredits :
                        plan.yearlyEarnedCredits
                    )}
                  </Typography>
                }
                <List sx={{ flexGrow: 1 }}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {typeof feature === "string" || !feature.disabled ? (
                          <CheckIcon sx={{ color: plan.color }} />
                        ) : (
                          <CloseIcon color="disabled" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={typeof feature === "string" ? feature : feature.text} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              {/* Button placed at the bottom */}
              <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
                <Button
                  fullWidth
                  variant="contained"
                  color={plan.title === "Advanced" ? "secondary" : "primary"}
                  size="large"
                  onClick={() => handleChangeSubScription({ planValue: plan.value, planPrice: yearly ? (plan.yearlyPrice) : plan.monthlyPrice })}
                  sx={{
                    py: 1.5,
                    fontSize: "1.1rem",
                  }}
                  disabled={isButtonDisabled(plan.value)}
                >
                  {getPlanLabel(plan)}
                </Button>
              </Box>
            </StyledCard>
          </Grid>
        ))}
        {updateSubscription ?
          <CustomModal
            actions={
              <Stack direction="row" spacing={2}>
                <Button onClick={() => {
                  setUpdateSubscription(false);
                  setCurrentPlan(null);
                }} variant="outlined" color="primary">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdatePaddleSubscriptionPlan({ planValue: currentPlan.planValue });
                    setUpdateSubscription(false);
                    setCurrentPlan({
                       planValue: null,
                       planPrice: 0
                    });
                    handleClose();
                  }}
                  variant="contained" color="primary">
                  Confirm
                </Button>
              </Stack>
            }
            open={updateSubscription}
            title={
              <Stack direction="row" spacing={1}>
                <Typography fontSize={16} fontWeight={600}>
                  Change Subscription Plan
                </Typography>
              </Stack>
            }
          >
            <Box pt={2} display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
              <Typography fontSize={14} fontWeight={500}>
                You are about to change your subscription plan. The updated plan will take effect immediately,
                and the amount shown below will be charged right away.
              </Typography>

              <Typography fontSize={14} fontWeight={500}>
                Plan: {yearly ? `${startCase(currentPlan.planValue)} Yearly` : `${startCase(currentPlan.planValue)} Monthly`}
              </Typography>

              <Typography fontSize={14} fontWeight={500}>
                Amount to be charged: ${currentPlan.planPrice}
              </Typography>
            </Box>
          </CustomModal>
          :
          null
        }
      </Grid>
    </>
  )
}
