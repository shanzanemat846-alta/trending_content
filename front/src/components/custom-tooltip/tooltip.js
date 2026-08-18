import { Tooltip, Box, Typography } from "@mui/material";

const CustomTooltip = ({ title, description, internalText, listItems }) =>  (
    <Tooltip
      title={
        <Box
          sx={{
            p: 1.5,
            "& p": {
              fontSize: "13px",
              color: "#4B5563",
              lineHeight: "20px",
              "&:first-of-type": { mb: 1 },
            },
          }}
        >
          {title && (
            <Typography fontSize={16} fontWeight="700">
              {title}
            </Typography>
          )}

          {description && <Typography>{description}</Typography>}
          {internalText && <Typography>{internalText}</Typography>}
          
          {listItems && listItems.length > 0 && (
            <Box component="ol" sx={{ pl: 2, mt: 1 }}>
              {listItems.map((item, index) => (
                <Box component="li" key={index} sx={{ fontSize: "13px", color: "#4B5563" }}>
                  {item}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      }
      arrow
      placement="right"
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: "#F9FAFB",
            "& .MuiTooltip-arrow": {
              color: "#F9FAFB",
            },
            maxWidth: "400px",
            borderRadius: "8px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          },
        },
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0002 13.3333V13.75M10.0002 11.25V10.8333L11.3983 8.73617C11.5734 8.4735 11.6668 8.16486 11.6668 7.84915C11.6668 6.9248 10.8957 6.25 10.0002 6.25C9.07975 6.25 8.3335 6.99619 8.3335 7.91667" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.0002 18.3333C14.6026 18.3333 18.3335 14.6023 18.3335 9.99999C18.3335 5.39761 14.6026 1.66666 10.0002 1.66666C5.39784 1.66666 1.66687 5.39761 1.66687 9.99999C1.66687 11.3132 2.00198 12.451 2.55369 13.5205C2.77003 13.9399 2.83946 14.4247 2.70386 14.8767L2.11158 16.851C1.92088 17.4867 2.51355 18.0793 3.14922 17.8887L5.12349 17.2963C5.57551 17.1607 6.06026 17.2302 6.47967 17.4465C7.5492 17.9982 8.687 18.3333 10.0002 18.3333Z" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Tooltip>
  );

export default CustomTooltip;
