"use client"

import { useState, useEffect } from "react"
import dayjs from "dayjs"
import {
  Box,
  Card,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from "@mui/material"

import { useAppDispatch, useAppSelector } from "src/app/lib/hooks"
import CustomDateRangePicker from "src/components/date-range/date-range-picker"
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { GetTopCreditDemographics } from "src/app/lib/slices/admin-slice"

export default function UserAnalyticsPage() {
  const dispatch = useAppDispatch()
  const { demographicsList, getTopCreditDemographicsLoading } = useAppSelector((state) => state.admin)
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, "days"),
    dayjs(),
  ])
  const [allDateRange, setAllDateRange] = useState(null);
  const [dateError, setDateError] = useState(false)

  const [startDate, endDate] = dateRange

  useEffect(() => {
    dispatch(
      GetTopCreditDemographics({
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
      })
    )
  }, [dateRange])

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Demographics"
        links={[
          { name: 'Demographics' },
          { name: 'List'}
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Top 10 Demographic Usage Stats
        </Typography>

        <Box position="relative">
         
            <CustomDateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
              setDateError={setDateError}
              position= "absolute"
              top
              setAllDateRange={setAllDateRange}
              allDateRange={allDateRange}
            />

        <Paper elevation={2}>
          <TableContainer sx={{ minHeight: "544px" }}>
            {getTopCreditDemographicsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
              </Box>
            ) : (
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Reddit</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>YouTube</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>ChatGPT</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>MultiPlatform</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Save Content</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Total Credits Consumed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {demographicsList?.length > 0 ? (
                    demographicsList?.map((user, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{(user.REDDIT_CAMPAIGN || 0).toFixed(2)}</TableCell>
                        <TableCell>{(user.YOUTUBE_CAMPAIGN || 0).toFixed(2)}</TableCell>
                        <TableCell>{(user.GPT || 0).toFixed(2)}</TableCell>
                        <TableCell>{(user.MULTI_PLATFORM_CAMPAIGN || 0).toFixed(2)}</TableCell>
                        <TableCell>{(user.SAVE_CONTENT || 0).toFixed(2)}</TableCell>
                        <TableCell>{(user.totalDeductionAmount || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3, height: 400}}>
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          height="100%"
                        >
                          No Data Found
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Paper>
        </Box>
      </Box>
    </Container>
  )
}
