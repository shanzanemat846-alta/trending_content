"use client"

import { useState, useEffect } from "react"
import moment from "moment";
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
  CircularProgress,
  TextField,
  InputAdornment
} from "@mui/material"

import { useAppDispatch, useAppSelector } from "src/app/lib/hooks"
import CustomDateRangePicker from "src/components/date-range/date-range-picker"
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { GetCreditsHistory } from "src/app/lib/slices/admin-slice";
import { useDebounce } from 'src/hooks/use-debounce';
import Iconify from 'src/components/iconify';

import { startCase } from "lodash";

const CreditsHistory = () => {
  const dispatch = useAppDispatch()
  const { creditsHistory, getCreditsHistoryLoading } = useAppSelector((state) => state.admin)
  const [allDateRange, setAllDateRange] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, "days"),
    dayjs(),
  ]);
  const [filters, setFilters] = useState({
    searchByKeyWords: {
      keys: ['firstName', 'lastName', 'email'],
      value: ''
    }
  });
  const [dateError, setDateError] = useState(false)
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const [startDate, endDate] = dateRange

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        searchByKeyWords: {
          ...prevFilters.searchByKeyWords,
          value: debouncedSearchTerm,
        },
      }));
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    console.log('allDateRange: ', allDateRange, 'filters: ', filters);
    dispatch(
      GetCreditsHistory({
        filters: {
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
          type: 'MANUAL_CREDITS',
          ...filters
        }
      })
    )
  }, [dateRange, allDateRange, filters])

  const handleSearch = (value) => {
    setSearchTerm(value);
  }

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
          Credits History
        </Typography>

        <Box position="relative">
         <Box display="flex" alignItems="center" gap={1}>
            <CustomDateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
              setDateError={setDateError}
              position= "absolute"
              top
              setAllDateRange={setAllDateRange}
              allDateRange={allDateRange}
            />
            <TextField
              placeholder="Search by Name and Email"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{
                width: "309px",
              }}
              InputProps={{
                sx: {
                  height: "45px !important",
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
         </Box>

        <Paper elevation={2}>
          <TableContainer sx={{ minHeight: "544px" }}>
            {getCreditsHistoryLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
              </Box>
            ) : (
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Previous Credits</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Additional Credits</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Modified Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Modified By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditsHistory?.length > 0 ? (
                    creditsHistory?.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{`${row.user.firstName} ${row.user.lastName}`}</TableCell>
                        <TableCell>{row.user.email}</TableCell>
                        <TableCell>{(row.prevCredits.used || 0).toFixed(2)}{'/'}{(row.prevCredits.total || 0).toFixed(2)}</TableCell>
                        <TableCell>{(row.additionalCredits || 0)}</TableCell>
                        <TableCell>{row.timestamp ? moment(row.timestamp).format('MM-DD-YYYY'): '--'}</TableCell>
                        <TableCell>{startCase(row?.addedByUser?.role)}</TableCell>
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

export default CreditsHistory;
