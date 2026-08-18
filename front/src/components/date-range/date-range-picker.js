import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import {
  Stack,
  Button,
  Box,
  TextField
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from "dayjs";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { enUS } from "date-fns/locale";

const CustomDateRangePicker = ({
  dateRange,
  setDateRange,
  setDateError,
  position = "relative",
  top = false,
  createCampaignPage,
  setAllDateRange,
  allDateRange
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState(
    `${dayjs(dateRange[0]).format("MM/DD/YYYY")} - ${dayjs(dateRange[1]).format("MM/DD/YYYY")}`
  );
  const [error, setError] = useState(false);
  const [dateRangeValue, setDateRangeValue] = useState([
    {
      startDate: dateRange[0].toDate(),
      endDate: dateRange[1].toDate(),
      key: "selection",
    },
  ]);


  const isMobile = useMediaQuery("(max-width:922px)");

  const applyShortcut = (days) => {
    const today = new Date();
    const newStartDate = dayjs().subtract(days, "days").toDate();
    setDateRangeValue([
      {
        startDate: newStartDate,
        endDate: today,
        key: "selection",
      },
    ]);
    setInputValue(
      `${dayjs(newStartDate).format("MM/DD/YYYY")} - ${dayjs(today).format("MM/DD/YYYY")}`
    );
    handleApply();
  };

  const handleDateChange = (ranges) => {
    setDateRangeValue([ranges.selection]);
    setInputValue(
      `${dayjs(ranges.selection.startDate).format("MM/DD/YYYY")} - ${dayjs(ranges.selection.endDate).format("MM/DD/YYYY")}`
    );
    setAllDateRange(null)
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleValidateDate = () => {
    if (allDateRange) return;

    const regex = /^\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(inputValue)) {
      setError(true);
      setDateError(true);
      return;
    }

    const [startStr, endStr] = inputValue.split(" - ");
    const startDate = dayjs(startStr, "MM/DD/YYYY", true);
    const endDate = dayjs(endStr, "MM/DD/YYYY", true);

    if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
      setError(true);
      setDateError(true);
      return;
    }

    setError(false);
    setDateError(false);
    setDateRangeValue([
      {
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        key: "selection",
      },
    ]);
    setDateRange([startDate, endDate]);
  };

  const handleApply = () => {
    if (!allDateRange) {
      setDateRange([
        dayjs(dateRangeValue[0].startDate),
        dayjs(dateRangeValue[0].endDate),
      ]);
    }

    setShowPicker(false);
  };

  const handleCancel = () => {
    setDateRangeValue([
      {
        startDate: dateRange[0].toDate(),
        endDate: dateRange[1].toDate(),
        key: "selection",
      },
    ]);
    setInputValue(
      `${dayjs(dateRange[0]).format("MM/DD/YYYY")} - ${dayjs(dateRange[1]).format("MM/DD/YYYY")}`
    );
    setShowPicker(false);
  };

  useEffect(() => {
    if (!allDateRange) handleValidateDate();
  }, [inputValue, allDateRange]);

  return (
    <Stack marginBlock={2}>
      <TextField
        fullWidth
        label="Select Date Range"
        value={!allDateRange ? inputValue : 'All time'}
        onChange={handleInputChange}
        onBlur={handleValidateDate}
        error={error}
        helperText={error ? "Invalid date format (MM/DD/YYYY - MM/DD/YYYY)" : ""}
        onClick={() => setShowPicker(!showPicker)}
        sx={{
          backgroundColor: "white",
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#02A770" },
            "&.Mui-focused fieldset": { borderColor: "#02A770" },
          },
          width: '80%'
        }}
      />
      {showPicker && (
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column-reverse" : "row",
            gap: 2,
            mt: 2,
            top: top ? "38px" : 0,
            position,
            zIndex: 10,
            backgroundColor: "rgb(227, 249, 239)",
            borderRadius: "12px",
            padding: isMobile ? "8px" : "16px",
            width: "fit-content",
            overflow: "auto",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Stack
            spacing={2}
            sx={{
              minWidth: "120px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box display="flex" flexDirection={isMobile ? 'row' : "column"} gap={1}>
              <Button variant="contained" color="primary" onClick={() => {applyShortcut(7);  setAllDateRange(null)}}>
                Last 7 Days
              </Button>
              <Button variant="contained" color="primary" onClick={() => {applyShortcut(30);  setAllDateRange(null)}}>
                Last 30 Days
              </Button>
              <Button variant="contained" color="primary" onClick={() => {applyShortcut(90); setAllDateRange(null);}}>
                Last 90 Days
              </Button>
              {
                createCampaignPage ?
                  <Button variant="contained" color="primary" onClick={() => {setAllDateRange('allDateRange'); setShowPicker(false);}}>
                    All time
                  </Button>
                  : null
              }

            </Box>
            <Box mt="auto">
              <Box display="flex" justifyContent="space-between" gap={1}>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button color="primary" onClick={handleApply}>Apply</Button>
              </Box>
            </Box>
          </Stack>
          <Box className="date-range-picker" flex={1}>
            <DateRange
              ranges={dateRangeValue}
              onChange={handleDateChange}
              moveRangeOnFirstSelection={false}
              showSelectionPreview
              months={isMobile ? 1 : 2} // responsive month display
              direction={isMobile ? "vertical" : "horizontal"} // responsive layout
              rangeColors={["#02A770"]}
              locale={enUS}
            />
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default CustomDateRangePicker;
