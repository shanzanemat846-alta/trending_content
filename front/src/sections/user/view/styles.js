"use client"

import { styled } from "@mui/material/styles"
import { Paper, Button } from "@mui/material"

export const StyledPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  overflow: "hidden",
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
}))

export const FilterContainer = styled("div")({
  display: "flex",
  gap: "8px",
  marginBottom: "24px",
  alignItems: "left",
  "& .MuiOutlinedInput-root": {
    height: "45px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "gray", // Default border color
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "green", // Green border when focused
  },
})

export const SearchContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
  height: "45px",
  "& .MuiOutlinedInput-root": {
    height: "100%",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "gray",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "green",
  }
})

export const FooterContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "16px",
})

export const NewUserButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}))

export const StatusIndicator = styled("div")(({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "show all":
        return { color: "#1976D2", borderColor: "#1976D2", backgroundColor: "#E3F2FD" }; // Blue
      case "accepted":
        return { color: "#00A76F", borderColor: "#00A76F", backgroundColor: "#EEFBE5" }; // Green
      case "invited":
        return { color: "#FF5630", borderColor: "#FF5630", backgroundColor: "#FFF5F5" }; // Red
      case "pending":
        return { color: "#FF9800", borderColor: "#FF9800", backgroundColor: "#FFF3E0" }; // Orange
      case "disabled":
        return { color: "#7A7A7A", borderColor: "#7A7A7A", backgroundColor: "#F5F5F5" }; // Gray
      default:
        return { color: "#7A7A7A", borderColor: "#7A7A7A", backgroundColor: "#F5F5F5" };
    }
  }

  return {
    padding: "4px 12px",
    borderRadius: "16px",
    border: "1px solid",
    display: "inline-block",
    fontSize: "0.875rem",
    fontWeight: 500,
    textAlign: "center",
    whiteSpace: "nowrap",
    ...getStatusColor(),
  }
})

export const SubscriptionIndicator = styled("div")(({ subscriptionPlan }) => {
  const getSubscriptionColor = () => {
    switch (subscriptionPlan?.toLowerCase()) {
      case "free":
        return { color: "#1976D2", borderColor: "#1976D2", backgroundColor: "#E3F2FD" }; // Blue for Free
      case "starter":
        return { color: "#FF9800", borderColor: "#FF9800", backgroundColor: "#FFF3E0" }; // Orange for Starter
      case "advanced":
        return { color: "#00A76F", borderColor: "#00A76F", backgroundColor: "#E5FBE5" }; // Green for Advanced
      default:
        return { color: "#7A7A7A", borderColor: "#7A7A7A", backgroundColor: "#F5F5F5" }; // Gray for unknown types
    }
  };

  return {
    padding: "4px 12px",
    borderRadius: "16px",
    border: "1px solid",
    display: "inline-block",
    fontSize: "0.875rem",
    fontWeight: 500,
    textAlign: "center",
    whiteSpace: "nowrap",
    ...getSubscriptionColor(),
  };
});
