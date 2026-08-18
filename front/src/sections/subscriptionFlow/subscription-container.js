'use client';

import { useState, useEffect, useRef } from "react";
import { initializePaddle } from '@paddle/paddle-js';
import { Box, Button, Modal, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from "src/components/loading-screen";
import { useAuthContext } from 'src/auth/hooks';
import {SUBSCRIPTION_PLANS, SUBSCRIPTION_PRICE_IDS} from 'src/utils/constants';
import moment from "moment";

import { useAppDispatch, useAppSelector } from "src/app/lib/hooks";

import {
  GetUserSubscriptionPlanDetail,
  SetUserSubscriptionPlanState,
  ResetUserSubscriptionPlanNotify,
  RemoveSubscription,
  UpdatePaddleSubscription
} from 'src/app/lib/slices/subscription-slice';
import { SetUserState } from "src/app/lib/slices/user-slice";

import CustomModal from "src/components/modal/modal"
import { useBoolean } from 'src/hooks/use-boolean';
import { enqueueSnackbar } from 'src/components/snackbar';

import styled from "styled-components";

import SubscriptionModal from './subscription-plans-modal';

import SubscriptionDetails from './subscription-details';
import Invoices from './subscription-invoice';

const ModalStyleWrapper = styled.div`
    background-color: #fff;
    width: 100%;
    max-width: 1400px;
    margin: auto;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    padding: 24px;
    border-radius: 8px;
    height: ${({ isStep }) => {
    if (isStep === 0) return "95vh";
    if (isStep === 1) return "54vh";
    return "75vh";
  }};
  .parent-box-wrapper {
  height: ${({ isStep }) => {
    if (isStep === 0) {
      return "90vh";
    }
    if (isStep === 1) {
      return "54vh";
    }
    return "75vh";
  }};
}
  .subscription-container-flow{
    position: relative;
    height: auto;
  .stepper-flow-ui {
    position: absolute;
    left: 30%;
    right: 0;
    z-index: 1;
    top:${({ isStep }) => {
    if (isStep === 0) return "-24px";
    if (isStep === 1) return "-65px";
    return "-25px";
  }};
}
    }
`;

const SubscriptionContainer = () => {
  const settings = useSettingsContext();
  const showAddCardMessage = useBoolean();
  const addCard = useBoolean();
  const timeoutRef = useRef(null)

  const { user: { _id: userId, email } } = useAuthContext();

  const {
    updatePlanFromSaveContent
  } = useAppSelector((state) => state.user);

  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery("(max-width:899px)");

  const {
    userSubscriptionPlanDetails,
    getUserSubscriptionPlanLoading,
    notify: subscriptionNotify,
    notifyMessage: subscriptionNotifyMessage,
    notifyType: subscriptionNotifyType,
    paymentDetails,
    removeSubscriptionLoading,
    removeSubscription,
    updateSubscriptionPlan
  } = useAppSelector((state) => state.subscription);


  const [isYearly, setIsYearly] = useState(false)
  const [updatePlan, setUpdatePlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expiryDate, setExpiryDate] = useState(moment().toDate());

  const [isStep, setIsStep] = useState(0);
  const [modal, setModal] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [paddle, setPaddle] = useState(null);

  useEffect(() => {
    if (updatePlanFromSaveContent) {
      setModal(true);
      dispatch(SetUserState({ field: 'updatePlanFromSaveContent', value: false }))
    }
  }, [updatePlanFromSaveContent]);

  const fetchUserSubscriptionDetails = () => {
    console.log('userId: ', userId);
    dispatch(GetUserSubscriptionPlanDetail({ userId }));
  };

  const handleUpgradePlan = () => {
    setUpdatePlan(true);
  }

  const handlePlanSelection = (planValue) => {

    const priceId = isYearly 
    ? SUBSCRIPTION_PRICE_IDS[`${planValue.toUpperCase()}_YEARLY`] 
    : SUBSCRIPTION_PRICE_IDS[`${planValue.toUpperCase()}_MONTHLY`];

    const getSuccessUrl = () => `${process.env.NEXT_PUBLIC_HOST_API}/dashboard/user`;

    paddle.Checkout.open({
      settings: {
        successUrl: getSuccessUrl(),
        allowLogout: false,
        showAddDiscounts: false
      },
      items: [{ priceId, quantity: 1 }],
      customer: {
        email,
      },
      customData: {
        subscriptionPlan: planValue,
        userId,
        subscriptionType: isYearly? 'yearly' : 'monthly'
      }
    });
  };

  const handleUnsubscribePlan = (subscriptionId) => {
    dispatch(RemoveSubscription({ subscriptionId }));
  }

  const updatePaddleSubscriptionPlan = async({ planValue }) => {
    const userSubscriptionPlanId = userSubscriptionPlanDetails._id;

    const priceId = isYearly 
    ? SUBSCRIPTION_PRICE_IDS[`${planValue.toUpperCase()}_YEARLY`] 
    : SUBSCRIPTION_PRICE_IDS[`${planValue.toUpperCase()}_MONTHLY`];

    if (planValue === SUBSCRIPTION_PLANS.FREE) {
      const { subscriptionId } = userSubscriptionPlanDetails;
      handleUnsubscribePlan(subscriptionId)
    } else {
      dispatch(UpdatePaddleSubscription({
        userSubscriptionPlanId, 
        subscriptionPriceId: priceId,
        plan: planValue,
        isYearly
      }));
    }
  };

  useEffect(() => {
    if (removeSubscription) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        fetchUserSubscriptionDetails()
      }, 2000)
      dispatch(SetUserSubscriptionPlanState({ field: "removeSubscription", value: false }))
    }
  }, [removeSubscription])

  useEffect(() => {
    if (subscriptionNotify) {
      enqueueSnackbar(subscriptionNotifyMessage, { variant: subscriptionNotifyType });
      dispatch(ResetUserSubscriptionPlanNotify());
    }
  }, [subscriptionNotify, subscriptionNotifyMessage, subscriptionNotifyType]);

  useEffect(() => {
    fetchUserSubscriptionDetails();
  }, [userId]);

  useEffect(() => {
    if (updateSubscriptionPlan) {
      fetchUserSubscriptionDetails();
      dispatch(SetUserSubscriptionPlanState({ field: 'updateSubscriptionPlan', value: false }));
    }
  }, [updateSubscriptionPlan]);


  useEffect(() => {
    if (isYearly) {
      setExpiryDate(moment().add(1, "year").toDate());
    } else {
      setExpiryDate(moment().add(1, "month").toDate());
    }

    dispatch(SetUserSubscriptionPlanState({
      field: "paymentDetails",
      value: {
        ...paymentDetails,
        isYearly
      }
    }));
  }, [isYearly]);

  useEffect(() => {
    initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      eventCallback: (data) => {
        // if (data.name === "subscription.activated") {
          fetchUserSubscriptionDetails();
        // }
      },
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);  

  return (
    <>
      {getUserSubscriptionPlanLoading || removeSubscriptionLoading
        ? (
          <LoadingScreen
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 9999,
            }}
          />
        ) : null}
      <Box display="flex" alignItems="flex-start" flexDirection={isMobile ? 'column' : 'row'} gap={3}>
        <Box maxWidth={500}>
          <SubscriptionDetails
            billingAmount={userSubscriptionPlanDetails?.billingAmount || 0}
            subscriptionPlan={userSubscriptionPlanDetails?.subscriptionPlan}
            credits={userSubscriptionPlanDetails?.credits}
            subscriptionType={userSubscriptionPlanDetails?.subscriptionType}
            subscriptionDate={userSubscriptionPlanDetails?.subscriptionDate}
            status={userSubscriptionPlanDetails.status}
            handleUpgradePlan={handleUpgradePlan}
            handleUnsubscribePlan={handleUnsubscribePlan}
            subscriptionId={userSubscriptionPlanDetails.subscriptionId}
            freeCreditsDate={userSubscriptionPlanDetails.freeCreditsDate}
            setModal={setModal}
          />
        </Box>
        <Box p={2} minHeight={200} display="flex" justifyContent="center" alignItems="center" border="1px solid #ddd" borderRadius={1} boxShadow={1} flexGrow={1} sx={{ flex: 1, width: '100%' }}>
          <Invoices />
        </Box>
      </Box>
      <CustomModal
        actions={
          <Stack direction="row" spacing={2}>
            <Button onClick={() => setIsDelete(false)} variant="outlined" color="error">Cancel</Button>
            <Button onClick={() => setIsDelete(false)} variant="contained" color="error">Delete</Button>
          </Stack>
        }
        open={isDelete}
        title={
          <Stack direction="row" spacing={1}>
            <CreditCardIcon sx={{ color: 'red' }} />
            <Typography fontSize={16} fontWeight={600} color="red">Card Delete</Typography>
          </Stack>}
      >
        <Box pt={2} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
          <WarningAmberIcon sx={{ fontSize: 65, color: 'red' }} />
          <Typography fontSize={18} fontWeight={600} textAlign="center">Are you sure you want to remove this card</Typography>
        </Box>
      </CustomModal>

      {updatePlan ?
        <SubscriptionModal
          subscriptionType={userSubscriptionPlanDetails.subscriptionType}
          subscriptionPlan={userSubscriptionPlanDetails.subscriptionPlan}
          open={updatePlan}
          setOpen={setUpdatePlan}
          yearly={isYearly}
          setYearly={setIsYearly}
          handlePlanSelection={handlePlanSelection}
          handleClose={()=> setModal(false)}
        />
        :
        null
      }

      <Modal open={modal} onClose={() => setModal(false)}>
        <ModalStyleWrapper isStep={isStep}>
          <div className="subscription-container-flow">
          {isStep === 0 && (
              <Box overflow="auto" className="parent-box-wrapper">
                <SubscriptionModal
                  subscriptionType={userSubscriptionPlanDetails.subscriptionType}
                  subscriptionPlan={userSubscriptionPlanDetails.subscriptionPlan}
                  open={updatePlan}
                  setOpen={setUpdatePlan}
                  yearly={isYearly}
                  handleClose={()=> setModal(false)}
                  setYearly={setIsYearly}
                  handlePlanSelection={handlePlanSelection}
                  handleUpdatePaddleSubscriptionPlan={updatePaddleSubscriptionPlan}
                />
              </Box>
            )}
          </div>
        </ModalStyleWrapper>
      </Modal>
    </>
  );
}

export default SubscriptionContainer;