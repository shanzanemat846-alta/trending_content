"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
} from "@mui/material"
import { LoadingScreen } from "src/components/loading-screen"
import dayjs from "dayjs"

import { useAppDispatch, useAppSelector } from "src/app/lib/hooks"
import { GetUserCreditHistory } from "src/app/lib/slices/admin-slice"
import CustomDateRangePicker from "src/components/date-range/overlay-date-range"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <LoadingScreen className="h-[300px] w-full rounded-md" />,
})

const Modal = ({ open, onClose, title, actions, selectedUserId }) => {
  const dispatch = useAppDispatch()
  const { chartData, getChartDataLoading } = useAppSelector((state) => state.admin)

  const [dateRange, setDateRange] = useState([dayjs().subtract(7, "days"), dayjs()])
  const [dateError, setDateError] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const [chartOptions, setChartOptions] = useState({
    chart: { type: "pie", fontFamily: "inherit" },
    labels: [],
    colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
    legend: { position: "bottom", horizontalAlign: "center" },
    tooltip: { y: { formatter: (value) => `Credits Used: ${value}` } },
  })

  const [chartSeries, setChartSeries] = useState([])

  const fetchChartData = (startDate, endDate) => {
    if (!selectedUserId || dateError) return
    dispatch(
      GetUserCreditHistory({
        userId: selectedUserId,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
      })
    )
  }

  useEffect(() => {
    if (open && selectedUserId && !dateError) {
      fetchChartData(dateRange[0], dateRange[1])
    }
  }, [open]) // only once when modal opens

  useEffect(() => {
    if (chartData?.labels && chartData?.series) {
      setChartSeries(chartData.series)
      setChartOptions((prev) => ({
        ...prev,
        labels: chartData.labels,
      }))
    }
  }, [chartData])

  let content;

  if (getChartDataLoading) {
    content = (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <LoadingScreen />
      </Box>
    );
  } else if (chartSeries.length === 0 || chartSeries.every((val) => val === 0)) {
    content = (
      <Typography textAlign="center" color="text.secondary" mt={2}>
        No data available
      </Typography>
    );
  } else {
    content = (
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="pie"
        height={400}
      />
    );
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "900px",
          borderRadius: "16px",
          maxHeight: "90vh",
          overflow: "visible",
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid #E5E5E5" }}>{title}</DialogTitle>
      <DialogContent sx={{ mt: 2, py: 4, px: 3, position: "relative", overflow: "visible" }}>
        <Box sx={{ height: isPickerOpen ? '550px' : 'auto', position: "relative" }}>
          <CustomDateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            setDateError={setDateError}
            showPicker={isPickerOpen}
            setShowPicker={setIsPickerOpen}
            onApply={(start, end) => fetchChartData(start, end)}
          />

          <Box
            sx={{
              mt: 4,
              visibility: isPickerOpen ? "hidden" : "visible",
              opacity: isPickerOpen ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            {content}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E5E5E5" }}>
        {actions}
      </DialogActions>
    </Dialog>
  )
}

export default Modal
