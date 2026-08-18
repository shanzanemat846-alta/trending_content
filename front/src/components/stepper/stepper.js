"use client";

import { Box } from "@mui/material";
import CampaignIcon from '@mui/icons-material/Campaign';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ChatIcon from '@mui/icons-material/Chat';
import TryIcon from '@mui/icons-material/Try';
import InsightsIcon from '@mui/icons-material/Insights';
import styled from "styled-components";
import useMediaQuery from "@mui/material/useMediaQuery";


const steps = [
  "Create Project",
  "Create Campaign",
  "Select Threads",
  "Select Prompt",
  "Create Content using AI",
];
const StepperContainer = styled.div`
  display: flex;
  align-items: center;
  width: -webkit-fill-available;
  position: fixed;
  bottom: 0px !important;

  margin-right: 62px;
  z-index: 1000;
  @media (max-width: 1199px) {
    left: 0px !important;
    margin: 0;
  }
  @media (max-width: 899px) {
    left: 0px !important;
    margin: 0;
  }
  &.stepper-modal {
    top: 0;
}
`;

const StepperWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  width: 100%;
  grid-gap: 20px;
  height: 60px;
  @media (max-width: 407px) {
    grid-gap: 4px;
    justify-content: space-between;
  }
`;

const StepButton = styled.button`
  background-color: ${(props) =>
    (props.$status === "active" && "#2196F3") ||
    (props.$status === "completed" && "#4CAF50") ||
    "#E0E0E0"};
  color: white;
  padding: 3px 12px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  font-weight: bold;
  min-width: 120px;
  text-align: center;
  &.step-0 {
    position: absolute;
    .text-label{
    display: inline-block;
    }
    .icon{
      display: none;
    }
      @media (max-width: 899px) {
        min-width: 40px;
        .text-label{
        display: none;
        }
        .icon{
          display: block;
        }
      }
  }
  &.step-1 {
    position: absolute;
    .text-label{
    display: inline-block;
    }
    .icon{
      display: none;
    }
      @media (max-width: 899px) {
        min-width: 40px;
        .text-label{
        display: none;
        }
        .icon{
          display: block;
        }
      }
  }
  &.step-2 {
    position: absolute;
    .text-label{
    display: inline-block;
    }
    .icon{
      display: none;
    }
      @media (max-width: 899px) {
        min-width: 40px;
        .text-label{
        display: none;
        }
        .icon{
          display: block;
        }
      }
  }
  &.step-3 {
    position: absolute;
    .text-label{
    display: inline-block;
    }
    .icon{
      display: none;
    }
      @media (max-width: 899px) {
        min-width: 40px;
        .text-label{
        display: none;
        }
        .icon{
          display: block;
        }
      }
  }
  &.step-4 {
    position: absolute;
    .text-label{
    display: inline-block;
    }
    .icon{
      display: none;
    }
      @media (max-width: 899px) {
        min-width: 40px;
        .text-label{
        display: none;
        }
        .icon{
          display: block;
        }
      }
  }
`;

const ConnectingLine = styled.div`
  flex: 1;
  height: 5px;
  border-radius: 20px;
  background-color: ${({ $isCompleted }) =>
    $isCompleted ? "#4CAF50" : "#E0E0E0"};
  &.line-0 {
    width: 200px;
    @media (max-width: 899px) {
     width: 60px;
    }
  }
  &.line-1 {
    width: 20px;
    @media (max-width: 899px) {
     width: 60px;
    }
  }
  &.line-2 {
    width: 20px;
    @media (max-width: 899px) {
     width: 60px;
    }
  }
  &.line-3 {
    width: 20px;
    @media (max-width: 899px) {
     width: 60px;
    }
  }
  &.line-4 {
    width: 20px;
    @media (max-width: 899px) {
     width: 60px;
    }
  }
`;

export default function HorizontalLinearAlternativeLabelStepper({
  activeStepNumber,
  className,
  subscriptionPage,
  // handleStepClick,
}) {
const isMobile = useMediaQuery("(max-width:899px)");
  
  const subscriptionStepper = [
    "Chose you plan",
    "Add Card",
    "Checkout",
  ];
  
  return (
    <StepperContainer style={{background: isMobile ? '#feffff' : 'transparent', bottom: isMobile ? '24px' : '32px', display: isMobile ? 'flex' : '', justifyContent: isMobile ? 'flex-end' : '', flexDirection: isMobile ? 'column' : ''}} className={className}>
      {subscriptionPage ? 
      <StepperWrapper>
        {subscriptionStepper.map((label, index) => {
          let status = "upcoming";
          if (index < activeStepNumber) status = "completed";
          else if (index === activeStepNumber) status = "active";

          return (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <StepButton
                key={`step-${index}`}
                className={`steps step-${index}`}
                $status={status}
                // onClick={() => handleStepClick({ stepClicked: { label, index } })}
              >
                {label}
              </StepButton>
              {/* {index < steps.length - 1 && ( */}
              <ConnectingLine
                className={`line-${index}`}
                key={`line-${index}`}
                $isCompleted={index < activeStepNumber}
              />
              {/* )} */}
            </Box>
          );
        })}
      </StepperWrapper> 
      :
      <StepperWrapper>
        {steps.map((label, index) => {
          let status = "upcoming";
          if (index < activeStepNumber) status = "completed";
          else if (index === activeStepNumber) status = "active";

          return (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <StepButton
                key={`step-${index}`}
                className={`step-${index}`}
                $status={status}
                // onClick={() => handleStepClick({ stepClicked: { label, index } })}
              >
                <span className="text-label">{label}</span>
                {index === 0 && <AccountTreeIcon className="icon" />}
               {index === 1 && <CampaignIcon className="icon" />}
               {index === 2 && <ChatIcon className="icon" />}
               {index === 3 && <TryIcon className="icon" />}
               {index === 4 && <InsightsIcon className="icon" />}
              </StepButton>
              {/* {index < steps.length - 1 && ( */}
              <ConnectingLine
                className={`line-${index}`}
                key={`line-${index}`}
                $isCompleted={index < activeStepNumber}
              />
              {/* )} */}
            </Box>
          );
        })}
      </StepperWrapper>}
    </StepperContainer>
  );
}
