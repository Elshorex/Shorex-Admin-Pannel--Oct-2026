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
import { useNavigate } from "react-router-dom";
import moment from "moment";

import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import MainTable from "../components/table";
import ExportButton from "../components/ExportButton";
import StoreKeeperHistory from "../components/modals/storeKeeperHistory";
import { adminOptionsFilter } from "../constants/constant";
import CustomerMenuCell from "../components/menuCells/customerMeunCell";
import { useAuthState } from "../context";
import { isValidDate } from "../components/utils/Helper";
import CustomerFilter from "../components/Filters/customerFilter";

import SearchIcon from "@mui/icons-material/Search";

export default function Customer() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const user = useAuthState();
  const providerType = user?.userData?.type === "PROVIDER";
  const navigate = useNavigate();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [openSKHistory, setOpenSKHistory] = useState(false);

  const [rowData, setRowData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(storedPageSize);

  const [search, setSearch] = useState("");
  const [filterData, setFilterData] = useState(
    !providerType ? { adminFilter: "myData" } : {}
  );


  const columns = React.useMemo(
    () =>
      [
        filterData?.adminFilter === "allProviders" && {
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
        filterData?.adminFilter === "allData" && {
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
          accessorKey: "bussinessName",
          header: intl.formatMessage({ id: "stock.businessName" }),
        },
        {
          accessorKey: "name",
          header: intl.formatMessage({ id: "stock.customerName" }),
        },
        {
          accessorKey: "businessCategory",
          header: intl.formatMessage({ id: "sideNavbar.businessCategories" }),
        },
         {
          accessorKey: "customerArea",
          header: intl.formatMessage({ id: "customer.areaName" }),
        },
         {
          accessorKey: "customerCity",
          header: intl.formatMessage({ id: "customer.cityName" }),
        },
         {
          accessorKey: "customerRegion",
          header: intl.formatMessage({ id: "customer.regionName" }),
        },
        {
          accessorKey: "customerCountry",
          header: intl.formatMessage({ id: "customer.countryName" }),
        },
       
       
       
        {
          accessorKey: "joiningDate",
          header: intl.formatMessage({ id: "warehouse.joiningDate" }),
        },
        {
          header: intl.formatMessage({ id: "deleteAccount.deletionRequest" }),
          accessorKey: "deletionRequestStatus",
          cell: (row) => {
            const { deletionRequested } = row?.row?.original || {};
            if (!deletionRequested) {
              return <Typography variant="body2">—</Typography>;
            }
            return (
              <Chip
                label={intl.formatMessage({ id: "deleteAccount.requested" })}
                sx={{
                  backgroundColor: "#FF9800",
                  color: "#fff",
                  fontWeight: 500,
                  height: 28,
                }}
              />
            );
          },
        },
        {
          header: intl.formatMessage({ id: "driver.status" }),
          accessorKey: "statusName",
          cell: (row) => {
            const isActive = row?.row?.original?.status === 1;
            return (
              <Chip
                label={
                  isActive
                    ? intl.formatMessage({ id: "customer.active" })
                    : intl.formatMessage({ id: "customer.deactivated" })
                }
                sx={{
                  backgroundColor: isActive ? "#049A77" : "#FF4D4F",
                  color: "#fff",
                  fontWeight: 500,
                  height: 28,
                }}
              />
            );
          },
        },

        {
          cell: (row) => {
            return (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  setRowData(row);
                }}
              >
                <CustomerMenuCell row={row} getData={getData} />
              </Box>
            );
          },
          id: "action",
        },
      ].filter(Boolean),
    [filterData?.adminFilter]
  );

  const handleCloseSKHistory = () => setOpenSKHistory(false);
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `customer?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(`customer?removeLanguage=true&all=true`);

  const [fetchedStatus, , ] = useFetchedData(`/status?removeLanguage=true`);

  const [categoryData, , ] = useFetchedData(`/category?removeLanguage=true&all=true`);

  const [providersData, , ] = useFetchedData(`/provider?removeLanguage=true&all=true`);

  const filterChips = [
    {
      key: "product",
      label: categoryData?.data?.data?.find(
        (category) => category.id === filterData?.category
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
      key: "status",
      label: fetchedStatus?.data?.data?.find(
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
      key: "provider",
      label: providersData?.data?.data?.find(
        (Provider) => Provider.id === filterData?.Provider
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

  const mapData = (data,locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      statusName: item?.status?.name,
      businessCategory: item?.category?.name,
      joiningDate: moment(item?.joinDate).format("Do MMM YY"),
      customerRegion: item?.region[0]?.name,
      customerArea: item?.areas[0]?.name,
      customerCity: item?.city[0]?.name,
      customerCountry: item?.country?.name,

    }));
  };

  useEffect(() => {
    setData([]);
    let url = `customer?removeLanguage=true&page=${
      pageIndex + 1
    }&limit=${pageSize}`;
    search?.length > 0 && (url += `&name=${search}`);
    filterData?.status && (url += `&status=${filterData?.status}`);
    filterData?.category && (url += `&category=${filterData?.category}`);
    filterData?.adminFilter === "allProviders" && (url += `&hasProvider=true`);
    filterData?.adminFilter === "myData" && (url += `&hasNoProvider=true`);
    filterData?.adminFilter === "allData" && (url += `&allData=true`);
    filterData?.certainProvider && (url += `&provider=${filterData?.certainProvider}`);
    filterData?.fromDate && isValidDate(filterData?.fromDate) && (url += `&fromDate=${filterData?.fromDate}`);
    filterData?.toDate && isValidDate(filterData?.toDate) && (url += `&toDate=${filterData?.toDate}`);
    getData(url);
  }, [
    pageIndex,
    search,
    pageSize,
    filterData?.status,
    filterData?.category,
    filterData?.adminFilter,
    filterData?.certainProvider,
    filterData?.fromDate,
    filterData?.toDate,
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
    if (filterData?.adminFilter !== "certainProvider") {
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
    navigate("/ViewCustomerDetails", {
      state: { customerId: row?.original?.id },
    });
  };

  return (
    <Box  sx={{ width: "100%", p: "24px"}}>
        <CustomerFilter
          open={openFilter}
          handleClose={handleCloseFilter}
          setFilterData={setFilterData}
          filterData={filterData}
          fetchedStatus={fetchedStatus && fetchedStatus}
          categoryData={categoryData && categoryData}
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
            <FormattedMessage id="customer.customer" />
          </Typography>
        </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", pb: "32px" }}>
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
            {(filterData?.status ||
              filterData?.category ||
              filterData?.adminFilter ||
              filterData?.certainProvider ||
              filterData?.fromDate ||
              filterData?.toDate) && (
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
                    category: "",
                    status: "",
                    adminFilter: "",
                    certainProvider: "",
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
              handleRowClick,
              pageSize,
              setPageSize,
            }}
          />
    </Box>
  );
}
