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
import { useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "../../hooks/useLanguage";
import { useFetchedData } from "../../hooks/useFetchedData";
import MainTable from "../../components/table";
import ExportButton from "../../components/ExportButton";
import { useAuthState } from "../../context";
import { adminOptionsFilter } from "../../constants/constant";
import {
  formatNumberWithCommas,
  isValidDate,
} from "../../components/utils/Helper";
import RecycleRequestFilter from "../Filters/recycleRequestFilter";
import RewardsMenuCell from "../menuCells/RewardsMeunCell";

export default function DailyGainedPointsRewards() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const user = useAuthState();
  const providerType = user?.userData?.type === "PROVIDER";
  const location = useLocation()?.pathname;
  const isNotDashboard = location != "/dashboard" && location != "/";
  const navigate = useNavigate();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [rowData, setRowData] = useState({});

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(isNotDashboard ? storedPageSize : 5);

  const [totalCount, setTotalCount] = useState(1);
  const [search, setSearch] = useState("");
  const [filterData, setFilterData] = useState(
    !providerType ? { adminFilter: "myData" } : {}
  );

  const [fetchedData, loading, getNewData] = useFetchedData(
    `request?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [fetchedStatus, loadingState, getStatus] = useFetchedData(
    `/claim-request/available-status?removeLanguage=true`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `request?removeLanguage=true&all=true`
  );

  const [providersData, loadingProvidersData, getprovidersData] =
    useFetchedData(`/provider?removeLanguage=true&all=true`);

  const columns = React.useMemo(() => {
    const baseColumns = [
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
        header: intl.formatMessage({ id: "rewardsManagement.requestRef" }),
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
        header: intl.formatMessage({ id: "rewardsManagement.deliveryDateAndTime" }),
      },
      // {
      //   accessorKey: "requestTime",
      //   header: intl.formatMessage({ id: "rewardsManagement.deliveryTime" }),
      // },
      {
        accessorKey: "driverName",
        header: intl.formatMessage({ id: "driver.driverName" }),
      },
      {
        accessorKey: "productName",
        header: intl.formatMessage({ id: "products.productName" }),
      },
      {
        accessorKey: "quantity",
        header: intl.formatMessage({ id: "stock.quantity" }),
      },
      {
        accessorKey: "gainedPointsWithCommas",
        header: intl.formatMessage({ id: "rewardsManagement.gainedPoint" }),
      },
    ].filter(Boolean);

    if (isNotDashboard) {
      baseColumns.push({
        id: "action",
        cell: (row) => (
          <Box
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <RewardsMenuCell
              row={row}
              getData={getData}
              screen="gainedRewards"
            />
          </Box>
        ),
      });
    }

    return baseColumns;
  }, [filterData?.adminFilter, isNotDashboard]);

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
      postalCode: item?.customer?.postalCode,
      // location: item?.customer?.region?.name[locale],
      requestDateAndTime: moment(item?.pickupDate).format("Do MMM YYYY, h:mm a"),
      requestDate: moment(item?.pickupDate).format("Do MMM YY"),
      requestTime: moment(item?.pickupDate).format("h:mm a"),
      driverName: item?.driver?.name,
      productName: item?.product?.name[locale],
      gainedPointsWithCommas: formatNumberWithCommas(item?.gainedPoints || 0),
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `request?removeLanguage=true&page=${
      pageIndex + 1
    }&limit=${pageSize}`;
    search?.length > 0 && (url += `&search=${search}`);
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
    if (fetchedData && fetchedData?.data?.totalCount !== 0) {
      setTotalCount(fetchedData?.data?.totalCount);
    }
  }, [fetchedData.data?.totalCount]);

  useEffect(() => {
    if (fetchedData && fetchedData?.data?.data?.length !== 0) {
      const newData = mapData(fetchedData, locale);
      setData(newData);
    }
  }, [fetchedData, fetchedData?.data?.data?.length, pageSize, locale]);

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

  const handleRowClick = (row) => {
    setRowData(row);
    navigate("/ViewCustomerDetails", {
      state: { customerId: row?.original?.customer?.id },
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
      />

      {isNotDashboard && (
        <>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pb: "32px",
              }}
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
                      onDelete={() =>
                        setFilterData({ ...filterData, [key]: "" })
                      }
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
                    vehicle: "",
                    certainProvider: "",
                    provider: "",
                  })
                }
              />
            )}
          </Box>
        </>
      )}
      {loading && <CircularProgress />}

      <MainTable
        data={data ? data : []}
        totalCount={totalCount}
        {...{
          columns,
          pageIndex,
          setPageIndex,
          handleRowClick,
          pageSize,
          setPageSize,
        }}
      />
    </Box>
  );
}
