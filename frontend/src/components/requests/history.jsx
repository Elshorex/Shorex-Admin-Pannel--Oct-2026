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

export default function HistoryRequests() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const user = useAuthState();
  const providerType = user?.userData?.type === "PROVIDER";
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(storedPageSize);

  const [search, setSearch] = useState("");
  const [filterData, setFilterData] = useState(
    !providerType ? { adminFilter: "myData" } : {}
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // 🔥 critical
console.log(tz,'tz')
  const [deleteData, loadingDeleteWarehouse, deleteRow] = useDeleteData(
    `/request/deleteMutliple`,
    { ids: selectedRows }
  );

  const [fetchedAllData, loadingAllData, getAllNewData] = useFetchedData(
    `/request?history=true&tz=${tz}`
  );

  const [fetchedStatus, loadingStatus, getDataStatus] = useFetchedData(
    `/request/available-status?removeLanguage=true&all=true&tz=${tz}`
  );

  const [fetchedData, loading, getNewData] = useFetchedData(
    `request?status=DELIVERED&status=COMPLETED&page=${pageIndex + 1}&limit=${pageSize}&tz=${tz}`
  );

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
          header: intl.formatMessage({ id: "requestsManagement.pickUpDateAndTime" }),
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
          accessorKey: "postalCode",
          header: intl.formatMessage({ id: "customer.postalCode" }),
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

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/request?status=DELIVERED&status=COMPLETED&removeLanguage=true&all=true&tz=${tz}`
  );

  const [providersData, loadingProvidersData, getprovidersData] =
    useFetchedData(`/provider?removeLanguage=true&all=true&tz=${tz}`);

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
      postalCode: item?.customer?.postalCode,
      // location: item?.customer?.region?.name[locale],
      requestDateAndTime: moment(item?.pickupDate).format("Do MMM YYYY"),
      requestDate: moment(item?.pickupDate).format("Do MMM YY"),
      requestTime: moment(item?.pickupDate).format("h:mm a"),
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `/request?status=DELIVERED&status=COMPLETED&removeLanguage=true&page=${
      pageIndex + 1
    }&limit=${pageSize}&tz=${tz}`;
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
    tz
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
  }, [fetchedData,fetchedData.data?.data?.length ,pageSize, locale]);

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
                onClick={async () => await deleteRow()}
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
    </Box>
  );
}
