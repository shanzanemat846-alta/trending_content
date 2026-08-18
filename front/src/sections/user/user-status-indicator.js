"use client"

import { styled } from "@mui/material/styles"

export const StatusIndicator = styled("div")(({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "confirm":
        return {
          color: "#00A76F",
          borderColor: "#00A76F",
          backgroundColor: "#EEFBE5",
        }
      case "non confirm":
        return {
          color: "#FF5630",
          borderColor: "#FF5630",
          backgroundColor: "#FFF5F5",
        }
      default:
        return {
          color: "#7A7A7A",
          borderColor: "#7A7A7A",
          backgroundColor: "#F5F5F5",
        }
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
});


