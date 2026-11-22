import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Box,
  CircularProgress,
  Typography,
  Chip,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import SearchIcon from "@mui/icons-material/Search";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../hooks/useLanguage";
import { useFetchedData } from "../../hooks/useFetchedData";
import MainTable from "../../components/table";
import ExportButton from "../../components/ExportButton";
import { useAuthState } from "../../context";
import { adminOptionsFilter } from "../../constants/constant";
import { isValidDate } from "../../components/utils/Helper";
import RecycleRequestFilter from "../Filters/recycleRequestFilter";
import RequestsMenuCell from "../menuCells/RequestMeunCell";
import { useDeleteData } from "../../hooks/useDeleteData";
import WarningMessage from "../modals/warning_message";

export default function FailedRequests() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const user = useAuthState();
  const navigate = useNavigate();

  const providerType = user?.userData?.type === "PROVIDER";
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(storedPageSize);

  const [excelData, setExcelData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [OpenWarningDelete, setOpenWarningDelete] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [search, setSearch] = useState("");
  const [filterData, setFilterData] = useState(
    !providerType ? { adminFilter: "myData" } : {}
  );

  const [selectedRows, setSelectedRows] = useState([]);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `request?status=CANCELED&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [providersData, loadingProvidersData, getprovidersData] =
    useFetchedData(`/provider?removeLanguage=true&all=true`);

  const [fetchedStatus, loadingStatus, getDataStatus] = useFetchedData(
    `/request/available-status?removeLanguage=true&all=true`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/request?status=CANCELED&removeLanguage=true&all=true`
  );

  const [deleteData, loadingDeleteWarehouse, deleteRow] = useDeleteData(
    `/request/deleteMutliple`,
    { ids: selectedRows }
  );

  const onSubmitDelete = async () => {
    await deleteRow();
  };

  const columns = React.useMemo(
    () =>
      [
        filterData?.adminFilter == "allProviders" && {
          header: intl.formatMessage({ id: "warehouse.provider" }),
          cell: (row) => {
            return (
              <Typography>
                {row?.row?.original?.provider?.name || "Shorex"}
              </Typography>
            );
          },
          id: "providerName",
        },
        filterData?.adminFilter == "allData" && {
          header: intl.formatMessage({ id: "warehouse.provider" }),
          cell: (row) => {
            return (
              <Typography>
                {row?.row?.original?.provider?.name || "Shorex"}
              </Typography>
            );
          },
          id: "providerName",
        },
        {
          accessorKey: "requestId",
          header: intl.formatMessage({ id: "stock.requestID" }),
        },
        {
          accessorKey: "businessName",
          header: intl.formatMessage({ id: "stock.businessName" }),
        },
        {
          accessorKey: "customerName",
          header: intl.formatMessage({ id: "stock.customerName" }),
        },
        {
          accessorKey: "requestDateAndTime",
          header: intl.formatMessage({
            id: "requestsManagement.pickUpDateAndTime",
          }),
        },
        // {
        //   accessorKey: "requestTime",
        //   header: intl.formatMessage({ id: "requestsManagement.pickUpTime" }),
        // },
        {
          accessorKey: "location",
          header: intl.formatMessage({ id: "requestsManagement.location" }),
        },
        {
          accessorKey: "notes",
          header: intl.formatMessage({ id: "requestsManagement.note" }),
        },
        {
          accessorKey: "status",
          header: intl.formatMessage({ id: "stock.status" }),
        },
        {
          cell: (row) => {
            return (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <RequestsMenuCell
                  row={row}
                  getData={getData}
                  deleteAction={false}
                />
              </Box>
            );
          },
          id: "action",
        },
      ].filter(Boolean),
    [filterData?.adminFilter]
  );

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const filterChips = [
    { key: "fromDate", label: filterData?.fromDate },
    { key: "toDate", label: filterData?.toDate },
    {
      key: "status",
      label: fetchedStatus?.data?.result?.find(
        (status) => status?.id === filterData?.status
      )?.name[locale],
    },
    {
      key: "adminFilter",
      label: adminOptionsFilter?.find(
        (item) => item?.id === filterData?.adminFilter
      )?.name,
    },
    {
      key: "certainProvider",
      label: providersData?.data?.data?.find(
        (provider) => provider.id === filterData?.certainProvider
      )?.name,
    },
  ];

  const getData = (url) => {
    getNewData(url);
    search?.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  const mapData = (data) => {
    return data?.data?.data.map((item) => ({
      ...item,
      customerName: item?.customer?.name,
      businessName: item?.customer?.bussinessName,
      // note: item?.customer?.note,
      // location: item?.customer?.region?.name[locale],
      requestDateAndTime: moment(item?.pickupDate).format(
        "Do MMM YYYY"
      ),
      requestDate: moment(item?.pickupDate).format("Do MMM YY"),
      requestTime: moment(item?.pickupDate).format("h:mm a"),
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `/request?status=CANCELED&removeLanguage=true&page=${
      pageIndex + 1
    }&limit=${pageSize}`;
    search?.length > 0 && (url += `&name=${search}`);
    filterData?.status && (url += `&status=${filterData?.status}`);
    ((filterData?.fromDate && isValidDate(filterData?.fromDate)) ||
      (filterData?.toDate && isValidDate(filterData?.toDate))) &&
      (url += `&filterDateKey=pickupDate`);
    filterData?.fromDate &&
      isValidDate(filterData?.fromDate) &&
      (url += `&fromDateValue=${filterData?.fromDate}`);
    filterData?.toDate &&
      isValidDate(filterData?.toDate) &&
      (url += `&toDateValue=${filterData?.toDate}`);
    filterData?.adminFilter == "allProviders" && (url += `&hasProvider=true`);
    filterData?.adminFilter == "myData" && (url += `&hasNoProvider=true`);
    filterData?.adminFilter == "allData" && (url += `&allData=true`);
    filterData?.certainProvider &&
      (url += `&provider=${filterData?.certainProvider}`);
    getData(url);
  }, [
    pageIndex,
    search,
    pageSize,
    filterData?.status,
    filterData?.fromDate,
    filterData?.toDate,
    filterData?.adminFilter,
    filterData?.certainProvider,
  ]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.totalCount !== 0) {
      setTotalCount(fetchedData.data?.totalCount);
    }
  }, [fetchedData.data?.totalCount]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.data?.length !== 0) {
      const newData = mapData(fetchedData, locale);
      setData(newData);
    }
  }, [fetchedData, fetchedData.data?.data?.length, pageSize, locale]);

  useEffect(() => {
    if (allData && allData?.data?.data?.length !== 0) {
      const newData = mapData(allData, locale);
      setExcelData(newData);
    }
  }, [allData, locale]);

  //to remove the certain provider filter while remove provider name
  useEffect(() => {
    if (filterData?.adminFilter != "certainProvider") {
      setFilterData({ ...filterData, certainProvider: "" });
    }

    if (
      filterData?.adminFilter === "certainProvider" &&
      !filterData?.certainProvider
    ) {
      setFilterData({ ...filterData, adminFilter: "" });
    }
  }, [filterData?.certainProvider, filterData?.adminFilter]);

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(deleteData).length > 0) {
        await getData();
      }
    };

    fetchData();
  }, [Object.keys(deleteData).length]);

  const handleRowClick = (row) => {
    navigate(`/ViewRequestDetails`, {
      state: { requestId: row?.original?.id },
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <RecycleRequestFilter
        open={openFilter}
        handleClose={handleCloseFilter}
        fetchedStatus={fetchedStatus && fetchedStatus}
        setFilterData={setFilterData}
        filterData={filterData}
        providersData={providersData && providersData}
        // screenType="drivers"
      />

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", pb: "32px" }}
        >
          <FormControl variant="standard">
            <OutlinedInput
              id="input-with-icon-adornment"
              placeholder={intl.formatMessage({ id: "countries.search" })}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          {loading && <CircularProgress />}
          <Box>
            {selectedRows?.length > 0 && (
              <Button
                sx={{ mx: 1, px: 2, py: 1 }}
                variant="contained"
                color="error"
                onClick={() => setOpenWarningDelete(true)}
              >
                <Typography variant="h3">
                  <FormattedMessage id="warehouse.delete" />
                </Typography>
              </Button>
            )}
            <Button
              sx={{ mx: 3, px: 2, py: 1 }}
              variant="contained"
              onClick={() => handleOpenFilter()}
            >
              <Typography variant="h3">
                <FormattedMessage id="weekends.filter" />
              </Typography>
            </Button>
            <ExportButton
              loadingExcelData={loadingExcelData}
              data={excelData ? excelData : []}
              columns={columns ? columns : []}
              noLastUselessColumns={1}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mx: 2, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: "12px", mb: 2 }}>
          {filterChips.map(
            ({ key, label }) =>
              label && (
                <Chip
                  key={key}
                  label={<Typography variant="label">{label}</Typography>}
                  color="primary"
                  onDelete={() => setFilterData({ ...filterData, [key]: "" })}
                />
              )
          )}
        </Box>
        {(filterData?.status ||
          filterData?.fromDate ||
          filterData?.toDate ||
          filterData?.adminFilter ||
          filterData?.certainProvider) && (
          <Chip
            label={
              <Typography variant="label">
                <FormattedMessage id="weekends.clearAll" />
              </Typography>
            }
            variant="outlined"
            color="error"
            onClick={() =>
              setFilterData({
                fromDate: "",
                toDate: "",
                status: "",
                certainProvider: "",
                provider: "",
              })
            }
          />
        )}
      </Box>

      <MainTable
        data={data ? data : []}
        totalCount={totalCount}
        {...{
          columns,
          pageIndex,
          setPageIndex,
          loading,
          handleRowClick,
          pageSize,
          setPageSize,
        }}
        // onRowSelectionChange={setSelectedRows} // Handle row selection
        // selectedRows={selectedRows}
        // enableSelection={true}
      />

      <WarningMessage
        open={OpenWarningDelete}
        handleClose={() => setOpenWarningDelete(false)}
        message={intl.formatMessage({
          id: "requestsManagement.confirmationDelete",
        })}
        buttonName={intl.formatMessage({
          id: "warehouse.delete",
        })}
        buttonFunction={onSubmitDelete}
      />
    </Box>
  );
}
