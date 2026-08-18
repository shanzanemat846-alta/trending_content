"use client";

import { Modal, Box, Typography, Button, Stepper, Step, StepLabel } from "@mui/material";
import { useState } from "react";

const steps = [
  "Create a Project",
  "Create a Campaign",
  "Select Threads",
  "Select Prompts",
  "Create Content Using AI",
];

const OverViewModal = ({ open, setOverView }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prev) => (prev < 5 ? prev + 1 : prev));
    if (activeStep >= 5) {
      setOverView();
    }
  };

  const StepComponent = ({ image, title, description }) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", p: 3, mt: activeStep >= 1 ? "32px" : "0px" }}>
      <Box sx={{ width: 250, height: 150, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, mb: "28px" }}>
        <img src={image} alt={title} style={{ width: "100%", height: "auto" }} />
      </Box>
      <Typography fontSize={32} fontWeight={700} color="#1F1F1F" variant="h5" marginBottom="12px">
        {title}
      </Typography>
      <Typography maxWidth={activeStep >= 1 ? 622 : "auto"} variant="body1" fontSize={16} fontWeight={400} marginBottom="32px" color="#000000">
        {description}
      </Typography>
    </Box>
  );

  const getButtonText = () => {
    if (activeStep === 0) return "Let’s Start";
    if (activeStep === 5) return "Let’s Create Your First Project";
    return "Next";
  };

  return (
    <Modal open={open} aria-labelledby="welcome-modal">
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", maxWidth: activeStep >= 1 ? 800 : 622, bgcolor: "white", p: "24px", borderRadius: "8px", textAlign: "center" }}>
        {activeStep === 0 && (
          <Button
            variant="default"
            onClick={() => setOverView()}
            sx={{ background: "transparent", position: "absolute", top: 10, right: 10, color: "#4AA474", cursor: "pointer", "&:hover": { background: "transparent !important" } }}
          >
            Skip
          </Button>
        )}

        {activeStep >= 1 && (
          <Stepper activeStep={activeStep - 1} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {activeStep === 0 && <StepComponent image="/assets/Group-6.svg" title="Create a Project - Here's How Trending-Content Works" description="Discover how to create, manage, and optimize your projects effortlessly with our step-by-step guide. Let’s get started!" />}
        {activeStep === 1 && <StepComponent image="/assets/Group-1.svg" title="Create a Project" description="Start by creating a new project. Give it a title, select your ChatGPT model type, and input your OpenAI key to get started." />}
        {activeStep === 2 && <StepComponent image="/assets/Group-2.svg" title="Create a Campaign" description="Build campaigns tailored to your goals. Customize them to define how your project interacts with users or generates content." />}
        {activeStep === 3 && <StepComponent image="/assets/Group-3.svg" title="Select Threads" description="Pick relevant threads to guide your AI responses. Threads help structure your project for maximum efficiency and relevance." />}
        {activeStep === 4 && <StepComponent image="/assets/Group-4.svg" title="Select Prompts" description="Choose or create prompts that your AI will use to generate responses. This ensures personalized and precise outputs for your project needs." />}
        {activeStep === 5 && <StepComponent image="/assets/Group-5.svg" title="Create Content Using AI" description="Let AI take over! Generate high-quality content or responses tailored to your project, all within seconds." />}

        <Button variant="contained" sx={{ background: "#4AA474", marginBottom: "24px", "&:hover": { background: "#4AA474" } }} onClick={handleNext}>
          {getButtonText()}
        </Button>
      </Box>
    </Modal>
  );
};

export default OverViewModal;
