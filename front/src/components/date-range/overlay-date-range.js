"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-date-range"
import { Stack, Button, Box, TextField } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"
import dayjs from "dayjs"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"
import { enUS } from "date-fns/locale"

const CustomDateRangePickerOverlay = ({
  dateRange,
  setDateRange,
  setDateError,
  setShowPicker,
  showPicker,
  onApply,
  position,
  top
}) => {
  const [inputValue, setInputValue] = useState(
    `${dayjs(dateRange[0]).format("MM/DD/YYYY")} - ${dayjs(dateRange[1]).format("MM/DD/YYYY")}`
  )
  const [error, setError] = useState(false)
  const [dateRangeValue, setDateRangeValue] = useState([
    {
      startDate: dateRange[0].toDate(),
      endDate: dateRange[1].toDate(),
      key: "selection",
    },
  ])

  const applyShortcut = (days) => {
    const today = new Date()
    const newStartDate = dayjs().subtract(days, "days").toDate()

    setDateRangeValue([
      {
        startDate: newStartDate,
        endDate: today,
        key: "selection",
      },
    ])

    setInputValue(`${dayjs(newStartDate).format("MM/DD/YYYY")} - ${dayjs(today).format("MM/DD/YYYY")}`)

    const start = dayjs(newStartDate)
    const end = dayjs(today)
    setDateRange([start, end])
    onApply(start, end)
    setShowPicker(false)
  }

  const handleDateChange = (ranges) => {
    setDateRangeValue([ranges.selection])
    setInputValue(
      `${dayjs(ranges.selection.startDate).format("MM/DD/YYYY")} - ${dayjs(ranges.selection.endDate).format("MM/DD/YYYY")}`
    )
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleValidateDate = () => {
    const regex = /^\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}$/
    if (!regex.test(inputValue)) {
      setError(true)
      setDateError(true)
      return false
    }

    const [startStr, endStr] = inputValue.split(" - ")
    const startDate = dayjs(startStr, "MM/DD/YYYY", true)
    const endDate = dayjs(endStr, "MM/DD/YYYY", true)

    if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
      setError(true)
      setDateError(true)
      return false
    }

    setError(false)
    setDateError(false)
    setDateRangeValue([
      {
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        key: "selection",
      },
    ])
    return true
  }

  const handleApply = () => {
    if (!handleValidateDate()) return

    const start = dayjs(dateRangeValue[0].startDate)
    const end = dayjs(dateRangeValue[0].endDate)
    setDateRange([start, end])
    onApply(start, end)
    setShowPicker(false)
  }

  const handleCancel = () => {
    setShowPicker(false)
  }

  useEffect(() => {
    handleValidateDate()
  }, [inputValue]);

    const isMobile = useMediaQuery("(max-width:851px)");

  return (
    <Stack>
      <TextField
        fullWidth
        label="Select Date Range"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleValidateDate}
        error={error}
        helperText={error ? "Invalid format (MM/DD/YYYY - MM/DD/YYYY)" : ""}
        onClick={() => setShowPicker(!showPicker)}
        sx={{
          backgroundColor: "white",
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#02A770" },
            "&.Mui-focused fieldset": { borderColor: "#02A770" },
          },
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
          <Stack spacing={2} sx={{ minWidth: "120px", justifyContent: "space-between" }}>
            <Box display="flex" flexDirection={isMobile ? 'row' :"column"} gap={1}>
              <Button variant="contained" color="primary" onClick={() => applyShortcut(7)}>Last 7 Days</Button>
              <Button variant="contained" color="primary" onClick={() => applyShortcut(30)}>Last 30 Days</Button>
              <Button variant="contained" color="primary" onClick={() => applyShortcut(90)}>Last 90 Days</Button>
            </Box>
            <Box mt="auto">
              <Box display="flex" justifyContent="space-between" gap={1}>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleApply}>Apply</Button>
              </Box>
            </Box>
          </Stack>
          <Box flex={1}>
            <DateRange
              ranges={dateRangeValue}
              onChange={handleDateChange}
              moveRangeOnFirstSelection={false}
               months={isMobile ? 1 : 2}
              direction={isMobile ? "vertical" : "horizontal"}
              rangeColors={["#02A770"]}
              locale={enUS}
            />
          </Box>
        </Box>
      )}
    </Stack>
  )
}

export default CustomDateRangePickerOverlay
