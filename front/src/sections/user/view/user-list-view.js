'use client';

// lib
import { isEmpty, isEqual, startCase } from 'lodash';
import { useEffect, useState } from 'react';
import moment from 'moment';
// @mui
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  IconButton,
  InputLabel,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  FormGroup,
  Stack,
  Switch
} from "@mui/material";
import {
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
} from "@mui/icons-material"
// routes
import { paths } from 'src/routes/paths';
// redux
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { DeleteUsers, GetUsers, ResetAdminNotify, SetAdminState, UpdateUser, UpdateUserSubscriptionDetails } from 'src/app/lib/slices/admin-slice';
import { UpdateFreeCreditAccess, ResetUserSubscriptionPlanNotify } from 'src/app/lib/slices/subscription-slice';
// components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CustomModal from 'src/components/modal/modal';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import {
  TableHeadCustom,
  TableEmptyRows,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  emptyRows,
  useTable,
} from 'src/components/table';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// constants
import {
  LOADING_SCREEN_STYLES,
  USER_STATUS,
  STATUSES,
  USER_TABLE_HEADER,
  SUBSCRIPTION_STATUS
} from 'src/utils/constants';

import { SplitText } from 'src/utils/helpers';

import { InvoiceDrawer } from "./invoice-drawer"
import UserPieChart from "./user-pie-chart";

// styles
import {
  FilterContainer,
  SearchContainer,
  StatusIndicator,
  SubscriptionIndicator
} from "./styles";

const defaultFilters = {
  status: ['all'],
  searchByKeyWords: {
    keys: ['firstName', 'lastName', 'email'],
    value: ''
  }
};

export default function UserListView() {
  const table = useTable();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const {
    success,
    notifyType: adminNotifyType,
    notifyMessage: adminNotifyMessage,
    notify: adminNotify,
    getUserLoading,
    totalUsers,
    users,
    usersDeleted,
    userUpdated,
    deletingUsersLoading,
    updateUserLoading,
    updateCreditAccessLoading,
    getDefaultAdminModelLoading,
    userSubscriptionUpdated
  } = useAppSelector((state) => state.admin);

  const {
    notifyType: subscriptionNotifyType,
    notify: subscriptionNotify,
    notifyMessage: subscriptionNotifyMessage
  } = useAppSelector((state) => state.subscription);


  const settings = useSettingsContext();

  const [tableData, setTableData] = useState();
  const [sortValue, setSortValue] = useState({});
  const [pageNumber, setPageNumber] = useState(0);
  const [pageLimit, setPageLimit] = useState(5);
  const [userToDelete, setUserToDelete] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedFilters, setSelectedFilters] = useState(STATUSES)
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [filters, setFilters] = useState({
    status: ['all'],
    searchByKeyWords: {
      keys: ['firstName', 'lastName', 'email'],
      value: ''
    }
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState({
    deleteModalOpen: false,
    action: ''
  });
  const denseHeight = table.dense ? 52 : 72;
  const canReset = !isEqual(defaultFilters, filters);
  const [searchTerm, setSearchTerm] = useState("");
  const [prevStatus, setPrevStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(null);
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [newCredits, setNewCredits] = useState("");
  const [addCreditsManually, setAddCreditsManually] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [newCreditsError, setNewCreditsError] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const getUsers = () => {
    const skip = pageNumber * pageLimit;
    const limit = pageLimit;

    dispatch(GetUsers({
      skip, limit, filters, sortBy: sortValue
    }));
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId)
    setDeleteDialogOpen({
      deleteModalOpen: true,
      action: 'single'
    })
  }

  const canDeleteUser = (userValue) => {
    const hasActiveSubscription = userValue.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE
    const hasRemainingCredits = userValue.credits && userValue.credits.used !== userValue.credits.total
    return !(hasActiveSubscription || hasRemainingCredits)
  }

  const handleDeleteConfirm = () => {
    if (deleteDialogOpen.action === 'single') dispatch(DeleteUsers({ usersIdList: [userToDelete] }));
    else if (deleteDialogOpen.action === 'multi') {
      dispatch(DeleteUsers({ usersIdList: selectedUserIds }));
    }
  }

  const handleStatusChange = () => {
    if (editingUser) {
      dispatch(UpdateUser({
        userId: editingUser.id,
        updateParams: { status: editingUser.status }
      }));
    }
  }

  const handleToggleFreeCredit = (userId, newValue) => {
    dispatch(
      UpdateFreeCreditAccess({
        userId,
        freeCreditAccess: newValue,
      }),
    ).then((result) => {
        if (result.meta && result.meta.requestStatus === "fulfilled") {
          getUsers()
        }
      })
      .catch((error) => {
        console.error("Failed to update free credit access:", error)
      })
  }

  const handleCheckBox = (checked, selectedValue) => {
    const filteredSelectedValues = selectedFilters.filter(row => row.value !== 'all');

    let selectedStatusList = [];
    if (selectedValue === 'all' && checked) {
      selectedStatusList = STATUSES;
    } else if (selectedValue === 'all' && !checked) {
      selectedStatusList = [];
    } else if (selectedValue && checked) {
      const selectedValueObj = STATUSES.find(row => row.value === selectedValue);

      console.log('selectedValueObj: ', selectedValueObj);

      if (selectedValueObj) {
        filteredSelectedValues.push(selectedValueObj)

        console.log('filteredSelectedValues: ', filteredSelectedValues);

        if (filteredSelectedValues.length === STATUSES.length - 1) selectedStatusList = STATUSES;
        else selectedStatusList = filteredSelectedValues;
      }
    } else if (!checked && selectedValue) {
      selectedStatusList = selectedFilters.filter(row => row.value !== selectedValue && row.value !== 'all');
    }

    setSelectedFilters(selectedStatusList);
    setFilters({
      ...filters,
      status: selectedStatusList.map(row => row.value)
    });
    setPageNumber(0);
  };

  const handleEditClick = (userValue) => {
    setEditingUser({ id: userValue._id, status: userValue.status });

    const { subscriptionStatus, credits } = userValue;

    if (subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE || credits?.used !== credits?.total) {
      setIsSubscriptionActive(true);
    }

    setUser(userValue);
    setEditDialogOpen(true)
    setPrevStatus(userValue.status);
  }

  const handleSelectAllRows = (checked) => {
    if (checked) {
      setSelectedUserIds(users.map(row => row._id));
    } else {
      setSelectedUserIds([]);
    }
  }

  const handleSelectRow = (checked, id) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, id]);
    } else {
      setSelectedUserIds(prevValue => prevValue.filter(idValue => idValue !== id) || []);
    }
  }

  const handlePageChange = (event, newPage) => {
    setPageNumber(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setPageLimit(parseInt(e.target.value, 10));
    setPageNumber(0);
  }

  const SUBSCRIPTION_TYPE = {
    MONTHLY: "monthly",
    YEARLY: "yearly"
  }

  const nextBillingDate = (userData) => {
  if (!userData.subscriptionDate || !userData.subscriptionType) return null;

  if (userData.subscriptionType === SUBSCRIPTION_TYPE.MONTHLY) {
    return moment(userData.subscriptionDate).add(1, "month").format("YYYY-MM-DD");
  } if (userData.subscriptionType === SUBSCRIPTION_TYPE.YEARLY) {
    return moment(userData.subscriptionDate).add(1, "year").format("YYYY-MM-DD");
  }

    return null;
  };


  const getTooltipMessage = (userRow) => {
    if (canDeleteUser(userRow)) {
      return "Click here to delete user";
    }
    if (userRow.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE) {
      return `Cannot delete user with active subscription (valid until: ${nextBillingDate(userRow)})`;
    }
    return `Cannot delete user with remaining credits (${((userRow?.credits?.total || 0) - (userRow?.credits?.used || 0))?.toFixed(2)})`;
  };

  useEffect(() => {
    if (subscriptionNotify && subscriptionNotifyMessage) {
      enqueueSnackbar(SplitText(subscriptionNotifyMessage), { variant: subscriptionNotifyType });
      dispatch(ResetUserSubscriptionPlanNotify());
    }
  }, [subscriptionNotify, subscriptionNotifyMessage, subscriptionNotifyType]);

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        searchByKeyWords: {
          ...prevFilters.searchByKeyWords,
          value: debouncedSearchTerm,
        },
      }));
      setPageNumber(0);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  }
  // const handleSearch = debounce((value) => {
  //   setFilters({
  //     ...filters,
  //     searchByKeyWords: {
  //       ...filters.searchByKeyWords,
  //       value
  //     }
  //   });
  //   setPageNumber(0);
  // }, 500);

  useEffect(() => {
    if (userUpdated) {
      setEditDialogOpen(false);
      setEditingUser(null)
      setPrevStatus(null)
      dispatch(SetAdminState({ field: 'userUpdated', value: false }));
    }
  }, [userUpdated]);

  useEffect(() => {
    if (usersDeleted) {
      if (deleteDialogOpen.action === 'multi') {
        setSelectedUserIds([])
      } else {
        setUserToDelete(null);
      }
      // deleteDialogOpen.action === 'multi' ?  : 
      setDeleteDialogOpen({
        deleteModalOpen: false,
        action: ''
      });
      if (tableData.length === 1) {
        if (pageNumber !== 0) setPageNumber(pageNumber - 1);
        else getUsers();
      }
      else {
        getUsers();
      }
      // here unset the value
      dispatch(SetAdminState({ field: 'usersDeleted', value: false }));
    }
  }, [usersDeleted, dispatch]);

  useEffect(() => {
    if (users.length) setTableData(users);
    else setTableData([]);
  }, [users]);

  useEffect(() => {
    getUsers();
  }, [pageNumber, pageLimit, filters, sortValue]);

  useEffect(() => {
    if (adminNotifyMessage && adminNotify) {
      enqueueSnackbar(SplitText(adminNotifyMessage), { variant: adminNotifyType });
      dispatch(ResetAdminNotify());
    }
  }, [adminNotify, adminNotifyMessage]);

  const handleAddCredits = () => {
    dispatch(UpdateUserSubscriptionDetails({
      userId: selectedUser._id,
      updateParams: { newCredits: Number(newCredits) }
    }));

  }

  useEffect(() => {
    if (userSubscriptionUpdated) {
      dispatch(SetAdminState({ field: "userSubscriptionUpdated", value: false }));
      getUsers();
      setAddCreditsManually(false);
      setNewCredits("");
      setNewCreditsError("");
    }
  }, [userSubscriptionUpdated]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Users' },
            { name: 'List'}
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Box display="flex" justifyContent="space-between" direction="row">
            <Box display="flex" justifyContent="space-between" direction="row" gap={1} sx={{ margin: '22px 0 0 23px' }}>
              <FilterContainer>
                <FormControl fullWidth>
                  <InputLabel id="statusId" sx={{ textAlign: "center" }}>Status</InputLabel>
                  <Select
                    multiple
                    labelId="statusId"
                    value={selectedFilters?.map(status => status.value)}
                    input={<OutlinedInput label="Status" />}
                    renderValue={(selected) => {
                      const selectedLabels = selected?.map((value) => {
                        const option = STATUSES.find((item) => item.value === value);
                        return option ? option.label : '';
                      });
                      if (selectedLabels.includes('Show All')) {
                        return 'All'
                      }
                      return selectedLabels.join(', ');
                    }}
                    sx={{
                      width: "239px",
                      height: "45px",
                      color: 'black',
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {STATUSES.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        <Checkbox
                          checked={selectedFilters?.some(item => item.value === status.value)}
                          onChange={(e) => handleCheckBox(e.target.checked, status.value)}
                        />
                        <StatusIndicator status={status.value}>{status.label}</StatusIndicator>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FilterContainer>

              <SearchContainer>
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
              </SearchContainer>
            </Box>
            <div className="flex gap-2">
              <Tooltip title="Click to clear the filters and selections">
                <IconButton
                  disabled={!canReset}
                  onClick={() => {
                    setFilters({
                      status: ['all'],
                      searchByKeyWords: {
                        keys: ['firstName', 'lastName', 'email'],
                        value: ''
                      }
                    });
                    setSearchTerm('');
                    setSelectedFilters(STATUSES);
                    setSelectedUserIds([]);
                  }}
                  color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </div>
          </Box>
          {getUserLoading ? (
            <LoadingScreen
              sx={{
                ...LOADING_SCREEN_STYLES,
              }}
            />
          ) : null}
          {updateCreditAccessLoading ? (
            <LoadingScreen
              sx={{
                ...LOADING_SCREEN_STYLES,
              }}
            />
          ) : null}
          <TableContainer sx={{ position: 'relative', height: 'calc(100vh - 450px)' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={selectedUserIds.length}
              rowCount={tableData?.length}
              onSelectAllRows={(checked) => handleSelectAllRows(checked)}
              action={
                <Tooltip title="Click here to delete all the selected users">
                  <IconButton onClick={() => {
                    setDeleteDialogOpen({
                      deleteModalOpen: true,
                      action: 'multi'
                    });
                  }} color="error">
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />
              <Table
                stickyHeader aria-label="sticky table"
                size={table.dense ? 'small' : 'medium'}
                sx={{
                  minWidth: 960,
                }}
              >
                <TableHeadCustom
                  headLabel={USER_TABLE_HEADER}
                  rowCount={tableData?.length}
                  numSelected={selectedUserIds.length}
                  onSelectAllRows={(checked) => handleSelectAllRows(checked)}
                />
                <TableBody>
                  {tableData
                    ?.map((userRow) => (
                      <TableRow key={userRow.id} hover>
                        <TableCell sx={{ paddingBlock: '0px' }} padding="checkbox">
                          <Checkbox
                            checked={selectedUserIds?.includes(userRow?._id)}
                            onClick={(e) => handleSelectRow(e.target.checked, userRow._id)}
                          />
                        </TableCell>
                        <TableCell>
                          {`${userRow.firstName || ''} ${" "} ${userRow.lastName || ''}`}
                        </TableCell>
                        <TableCell>{userRow.email}</TableCell>
                        <TableCell>
                          <StatusIndicator status={userRow.status}>{startCase(userRow.status)}</StatusIndicator>
                        </TableCell>
                        <TableCell>
                          {
                            userRow.subscriptionPlan ?
                            <SubscriptionIndicator subscriptionPlan={userRow.subscriptionPlan}>
                              {startCase(userRow.subscriptionPlan)} {userRow.subscriptionType ? <> / {startCase(userRow.subscriptionType)}  </>: ''}
                            </SubscriptionIndicator>
                            : '--'
                          }
                        </TableCell>
                        <TableCell>
                          {(userRow?.totalAITokenConsumed || 0)?.toFixed(2)}
                        </TableCell>
                        <TableCell>{moment(userRow.createdAt).format('MM/DD/YYYY')}</TableCell>
                        <TableCell>
                          <Tooltip title="Enable Free Credit Access">
                            <Switch
                              checked={userRow.freeCreditAccess}
                              onChange={(e) => handleToggleFreeCredit(userRow._id, e.target.checked)}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => {
                              setSelectedUserId(userRow._id);
                              setInvoiceDrawerOpen(true);
                            }}
                            color="primary"
                          >
                            <Iconify icon="stash:invoice" />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Click here to view the user demographics">
                            <IconButton
                              onClick={() => {
                                setChartDialogOpen(true);
                                setSelectedUserId(userRow._id);
                              }}
                              color="primary"
                              disabled={(userRow.status !== USER_STATUS.ACCEPTED && userRow.status !== USER_STATUS.DISABLED)}
                            >
                              <Iconify icon="ix:piechart-filled" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="left" sx={{ whiteSpace: "nowrap" }}>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                          <Tooltip title="Click here to add the manual credits">
                            <IconButton 
                              disabled={userRow.status !== USER_STATUS.ACCEPTED}
                              color="primary" 
                              onClick={() => { setSelectedUser(userRow); setAddCreditsManually(true); }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Click here to edit the status">
                            <IconButton 
                              disabled={userRow.status !== USER_STATUS.ACCEPTED}
                              onClick={() => handleEditClick(userRow)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={getTooltipMessage(userRow)}>
                            <span>
                              <IconButton
                                onClick={() => handleDeleteClick(userRow._id)}
                                color="error"
                                disabled={!canDeleteUser(userRow)}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </span>
                         </Tooltip>
                         </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData?.length)}
                  />
                  <TableNoData notFound={!totalUsers} />
                </TableBody>
              </Table>
          </TableContainer>

          <TablePaginationCustom
            totalCount={totalUsers}
            page={pageNumber}
            rowsPerPage={pageLimit}
            handlePageChange={handlePageChange}
            handleRowsPerPageChange={handleChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>


    {editDialogOpen ? 
      <CustomModal
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setUser(null) }}
        onConfirm={handleStatusChange}
        title="Edit User Status"
        actions={
          <>
            <Button onClick={() => { setEditDialogOpen(false); setUser(null) }} variant="outlined">
              Cancel
            </Button>
            <Button 
              disabled={
                editingUser?.status === prevStatus 
                || isSubscriptionActive
              }
              onClick={handleStatusChange} variant="contained" color="primary">
              Update Status
            </Button>
          </>
        }
      >
        {
          isSubscriptionActive ? 
          <Alert style={{ marginTop: '10px' }} severity="warning">
          {user?.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE ? (
            <>
              <p>You cannot disable this user as they still have an active subscription.</p>
              <p>Subscription valid until: {nextBillingDate(user)}</p>
            </>
          ) : (
            <>
              <p>This user has remaining credits and cannot be disabled.</p>
              <p>Remaining Credits: {((user?.credits?.total || 0) - (user?.credits?.used || 0))?.toFixed(2)}</p>
            </>
          )}
        </Alert>
          :
          <Typography variant="body2" sx={{ mt: 1 }}>
            Disabling this user will revoke access to the application. They won’t be able to use any features.
          </Typography>
        }
        {
          updateUserLoading ? <LoadingScreen sx={{
            ...LOADING_SCREEN_STYLES
          }} /> : null
        }
        <FormControl component="fieldset" variant="standard" sx={{ mt: 4 }}>
          <FormGroup>
            <Stack display="flex" border="1px solid #00A76F" flexDirection="row" alignItems="center" sx={{ padding: "2px 8px", borderRadius: '8px' }}>
              <Typography color="primary" fontWeight="bold" sx={{ fontSize: 16 }}>Enable User</Typography>
              <Switch
                disabled={isSubscriptionActive}
                checked={editingUser?.status === USER_STATUS.DISABLED}
                onChange={(e) => {
                  console.log('editingUser: ', editingUser, 'checked value', editingUser?.status);
                  setEditingUser({
                    ...editingUser,
                    status: editingUser?.status !== USER_STATUS.DISABLED ? USER_STATUS.DISABLED : USER_STATUS.ACCEPTED
                  });
                }}
                name="toggle"
              />
              <Typography color="primary" fontWeight="bold" sx={{ fontSize: 16 }}>Disable User</Typography>
            </Stack>
          </FormGroup>
        </FormControl>
      </CustomModal>
      :null
    }
      <CustomModal
        open={deleteDialogOpen.deleteModalOpen}
        onClose={() => setDeleteDialogOpen({
          deleteModalOpen: false,
          action: ''
        })}
        onConfirm={() => handleDeleteConfirm()}
        title="Delete User"
        actions={
          <>
            <Button onClick={() => setDeleteDialogOpen({
              deleteModalOpen: false,
              action: ''
            })} variant="outlined">
              Cancel
            </Button>
            <Button onClick={() => handleDeleteConfirm('single')} variant="contained" color="error">
              Delete
            </Button>
          </>
        }
      >
        {
          deletingUsersLoading ? <LoadingScreen sx={{
            ...LOADING_SCREEN_STYLES
          }} /> : null
        }
        {deleteDialogOpen.action === 'single' && <p>Are you sure you want to delete this user? This action cannot be undone.</p>}
        {deleteDialogOpen.action === 'multi' && selectedUserIds.length && (
          <p>Are you sure you want to delete {selectedUserIds.id} users? This action cannot be undone.</p>
        )}
      </CustomModal>

      <CustomModal
        open={addCreditsManually}
        onClose={() => setAddCreditsManually(false)}
        onConfirm={() => { handleAddCredits(); setAddCreditsManually(false); }}
        title="Add Manual Credits"
        actions={
          <>
            <Button onClick={() => setAddCreditsManually(false)} variant="outlined">
              Cancel
            </Button>
            <Button disabled={!isEmpty(newCreditsError)} onClick={() => { handleAddCredits(); }} variant="contained" color="primary">
              Confirm
            </Button>
          </>
        }
      >
        <p>
          {selectedUser?.firstName} {selectedUser?.lastName} is subscribed to the{" "}
          <strong>{selectedUser.subscriptionPlan}</strong> {selectedUser?.subscriptionType} plan
          and currently has <strong>{(selectedUser?.credits?.total || 0) - (selectedUser?.credits?.used || 0)}</strong> credit available.
          If you manually add credits, the user’s available balance will increase.
        </p>
        <div className="space-y-2">
          <InputLabel htmlFor="newCredits" className="text-sm font-medium text-gray-700">
            Additional Credit Amount
          </InputLabel>

          {getDefaultAdminModelLoading ?
            <LoadingScreen
              sx={{
                ...LOADING_SCREEN_STYLES,
              }}
            />
            : null}
          <TextField
            id="newCredits"
            type="number"
            placeholder="Enter additional credit amount"
            value={newCredits}
            style={{ width: "350px" }}
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = Number(value);

              if (value === "" || Number.isNaN(numericValue)) {
                setNewCreditsError("Please enter a valid number");
              } else if (value > 5000000) {
                setNewCreditsError("Can not add credits more than 5M");
              } else if (numericValue < 0) {
                setNewCreditsError("Value cannot be negative");
              } else {
                setNewCreditsError("");
              }

              setNewCredits(value);
            }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            min="0"
          />
          {newCreditsError && (
            <p style={{ color: "red", fontSize: "10px" }}>{newCreditsError}</p>
          )}
        </div>
      </CustomModal>

      <UserPieChart
        open={chartDialogOpen}
        onClose={() => setChartDialogOpen(false)}
        title="User Demographics"
        selectedUserId={selectedUserId}
        actions={
          <>
            <Button onClick={() => setChartDialogOpen(false)} variant="outlined">
              Close
            </Button>
          </>
        }
      />
      <InvoiceDrawer open={invoiceDrawerOpen} onClose={() => setInvoiceDrawerOpen(false)} userId={selectedUserId} />
    </>
  );
}
