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
import moment from "moment";
import { Link, useLocation } from "react-router-dom";

import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import MainTable from "../components/table";
import ExportButton from "../components/ExportButton";
import StoreKeeperHistory from "../components/modals/storeKeeperHistory";
import RequestFilter from "../components/Filters/requestFilter";
import { adminOptionsFilter, stockOptions } from "../constants/constant";

import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useAuthState } from "../context";
import { isValidDate } from "../components/utils/Helper";

export default function Stock() {
  const { locale } = useLanguage();
  const location = useLocation();
  const { id } = location?.state || {};

  const user = useAuthState();
  const providerType = user?.userData?.type === "PROVIDER";
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [openSKHistory, setOpenSKHistory] = useState(false);
  const [pageSize, setPageSize] = useState( storedPageSize );

  const [rowData, setRowData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [search, setSearch] = useState("");
  const [filterData, setFilterData] = useState( !providerType
    ? { adminFilter: "myData" }
    : {});
  /* !customerId */
  const columns = React.useMemo(
    () => [
      {
        accessorKey: "requestId",
        header: intl.formatMessage({ id: "stock.requestID" }),
      },
      // {
      //   accessorKey: "customerName",
      //   header: intl.formatMessage({ id: "stock.businessName" }),
      // },
      {
        accessorKey: "customerName",
        header: intl.formatMessage({ id: "stock.customerName" }),
      },
      {
        accessorKey: "requestDate",
        header: intl.formatMessage({ id: "stock.requestDate" }),
      },
      {
        accessorKey: "driverName",
        header: intl.formatMessage({ id: "stock.driverName" }),
      },
      {
        accessorKey: "quality",
        header: intl.formatMessage({ id: "stock.quality" }),
      },
      {
        accessorKey: "quantity",
        header: intl.formatMessage({ id: "stock.quantity" }),
      },
      {
        accessorKey: "joiningDateFormat",
        header: intl.formatMessage({ id: "stock.deliveryTime" }),
      },
      {
        header: intl.formatMessage({ id: "driver.status" }),
          accessorKey: "status",
        // cell: (row) => {
        //   return (
        //     <>
        //       <Typography
        //         color={row?.row?.original?.status == "pending" ? "" : "error"}
        //       >
        //         {row?.row?.original?.status}
        //       </Typography>
        //     </>
        //   );
        // },
      },
      {
        accessorKey: "customerNotes",
        header: intl.formatMessage({ id: "customer.notes" }),
      },
    ],
    [filterData?.adminFilter]
  );

  const handleCloseSKHistory = () => setOpenSKHistory(false);
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `request?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}&warehouse=${id}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `request?removeLanguage=true&all=true&warehouse=${id}`
  );

  const [providersData, loadingProvidersData, getprovidersData] =
    useFetchedData(`/provider?removeLanguage=true&all=true`);

  const [fetchedVehicles, loadingVehicle, getDataVehicle] = useFetchedData(
    "/vehicle?removeLanguage=true"
  );

  const [fetchedStatus, loadingStatus, getDataStatus] = useFetchedData(
    "/request/available-status"
  );

  const filterChips = [
    {
      key: "vehicle",
      label: fetchedVehicles?.data?.data?.find(
        (vehicle) => vehicle?.id === filterData?.vehicle
      )?.name[locale],
    },
    { key: "fromDate", label: filterData?.fromDate },
    {
      key: "toDate",
      label:
        filterData?.toDate &&
        isValidDate(filterData?.toDate) &&
        filterData?.toDate,
    },
    {
      key: "adminFilter",
      label: adminOptionsFilter?.find(
        (item) => item?.id === filterData?.adminFilter
      )?.name,
    },
    {
      key: "status",
      label:fetchedStatus?.data?.result?.find(
        (status) => status?.id === filterData?.status
      )?.name[locale],
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
      driverName: item?.driver?.name,
      // vehicleNumber: item?.vehicle?.vehicleNumber,
      status: item?.status,
      requestDate: moment(item.createdAt).format("Do MMM YY"),
      customerNotes: item?.note,
      joiningDateFormat: item?.deliveryDate
        ? moment(item?.deliveryDate).format("Do MMM YY")
        : "Not assigned",
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `request?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}&warehouse=${id}`;
    search?.length > 0 && (url += `&name=${search}`);
    filterData?.vehicle && (url += `&vehicle=${filterData?.vehicle}`);
    filterData?.status && (url += `&status=${filterData?.status}`);
    filterData?.vehicle && (url += `&vehicle=${filterData?.vehicle}`);
    filterData?.adminFilter == "allProviders" && (url += `&hasProvider=true`);
    filterData?.adminFilter == "myData" && (url += `&hasNoProvider=true`);
    filterData?.adminFilter == "allData" && (url += `&allData=true`);
    filterData?.certainProvider &&
      (url += `&provider=${filterData?.certainProvider}`);
    filterData?.fromDate &&
      isValidDate(filterData?.fromDate) &&
      (url += `&fromDateValue=${filterData?.fromDate}`);
    filterData?.toDate &&
      isValidDate(filterData?.toDate) &&
      (url += `&toDateValue=${filterData?.toDate}`);
    getData(url);
  }, [
    pageIndex,
    search,
    pageSize,
    filterData?.vehicle,
    filterData?.status,
    filterData?.adminFilter,
    filterData?.certainProvider,
    filterData?.fromDate,
    filterData?.toDate,
  ]);

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

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <RequestFilter
        open={openFilter}
        handleClose={handleCloseFilter}
        setFilterData={setFilterData}
        filterData={filterData}
        fetchedVehicles={fetchedVehicles && fetchedVehicles}
        fetchedStatus={fetchedStatus && fetchedStatus}
        providersData={providersData && providersData}
      />

      <StoreKeeperHistory
        open={openSKHistory}
        handleClose={handleCloseSKHistory}
        row={rowData}
        flag="StoreKeeperHistory"
      />

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            pb: "24px",
          }}
        >
          <Typography variant="h2">
            <Link to="/stock/">
              <ArrowBackIosIcon
                fontSize="12px"
                sx={{ mt: "4px", mx: 1, scale: locale == "ar" && "-1" }}
              />
            </Link>
            <FormattedMessage id="stock.requests" />
          </Typography>
        </Box>
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
        {(filterData?.vehicle ||
          filterData?.status ||
          filterData?.adminFilter ||
          filterData?.certainProvider ||
          filterData?.fromDate ||
          filterData?.toDate
      ) && (
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
                vehicle: "",
                fromDate: "",
                toDate: "",
                status: "",
                adminFilter: "",
                certainProvider: "",
                provider: "",
              })
            }
          />
        )}
      </Box>
  {console.log(data,'data')}
      <MainTable
        data={data ? data : []}
        totalCount={totalCount}
        {...{ columns, pageIndex, setPageIndex,           pageSize,
          setPageSize, }}
      />
    </Box>
  );
}
