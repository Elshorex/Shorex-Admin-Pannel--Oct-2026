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

import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import MainTable from "../components/table";
import ExportButton from "../components/ExportButton";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";

import StoreKeeperHistory from "../components/modals/storeKeeperHistory";
import DriverFilter from "../components/Filters/driver_vehicleFilter";
import VehicleMenuCell from "../components/menuCells/VehicleMenuCell";
import { adminOptionsFilter } from "../constants/constant";
import { isValidDate } from "../components/utils/Helper";
import { useAuthState } from "../context";

export default function Drivers() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const navigate = useNavigate();
  const user = useAuthState();
  const providerType = user?.userData?.type === "PROVIDER";
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
  const [filterData, setFilterData] = useState(
    !providerType ? { adminFilter: "myData" } : {}
  );

  const handleRowClick = (row) => {
    setRowData(row);
    navigate("/VehiclesFlow", {
      state: { id: row?.original?.id, action: "viewData" },
    });
  };

  const columns = [
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
      accessorKey: "name",
      header: intl.formatMessage({ id: "vehicle.vehicleName" }),
    },
    {
      accessorKey: "vehicleNumber",
      header: intl.formatMessage({ id: "vehicle.vehicleNumber" }),
    },
    {
      accessorKey: "trademarkName",
      header: intl.formatMessage({ id: "vehicle.trademark" }),
    },
    {
      accessorKey: "model",
      header: intl.formatMessage({ id: "vehicle.model" }),
    },
    {
      accessorKey: "driverName",
      header: intl.formatMessage({ id: "vehicle.driverName" }),
      cell: (row) => {
        return (
          <>
            <Typography
              color={
                row?.row?.original?.driverName != "Not assigned" ? "" : "error"
              }
            >
              {row?.row?.original?.driverName}
            </Typography>
          </>
        );
      },
    },
    // {
    //   accessorKey: "statusName",
    //   header: intl.formatMessage({ id: "vehicle.status" }),
    //   cell: (row) => {
    //     return (
    //       <>
    //         <Typography
    //           color={row?.row?.original?.status === 1 ? "#00B887" : "error"}
    //         >
    //           {row?.row?.original?.status}
    //         </Typography>
    //       </>
    //     );
    //   },
    // },
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
            }}
          >
            <VehicleMenuCell
              row={row}
              getData={getData}
              handleOpenSKHistory={handleOpenSKHistory}
            />
          </Box>
        );
      },
      id: "action",
    },
  ].filter(Boolean);

  const handleOpenSKHistory = () => setOpenSKHistory(true);
  const handleCloseSKHistory = () => setOpenSKHistory(false);
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const [trademarksData, loadingTrademarkData, getTrademarkData] =
    useFetchedData(`/trademark?removeLanguage=true&all=true`);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `vehicle?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [fetchedStatus, loadingState, getStatus] = useFetchedData(
    `/status?removeLanguage=true`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `vehicle?removeLanguage=true&all=true`
  );

  const [providersData, loadingProvidersData, getprovidersData] =
    useFetchedData(`/provider?removeLanguage=true&all=true`);

  const filterChips = [
    { key: "fromDate", label: filterData?.fromDate },
    { key: "toDate", label: filterData?.toDate },
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

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      driverName:
        item.drivers?.length > 0
          ? item.drivers?.map((pro) => pro?.name).join(" - ")
          : "Not assigned",
      statusName: item.status,
      trademarkName: item?.trademark,
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `vehicle?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    search?.length > 0 && (url += `&name=${search}`);
    filterData?.status && (url += `&status=${filterData?.status}`);
    filterData?.fromDate &&
      isValidDate(filterData?.fromDate) &&
      (url += `&fromJoiningDate=${filterData?.fromDate}`);
    filterData?.toDate &&
      isValidDate(filterData?.toDate) &&
      (url += `&toJoiningDate=${filterData?.toDate}`);
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
  }, [fetchedData,fetchedData.data?.data?.length ,pageSize, locale]);

  useEffect(() => {
    if (allData && allData?.data?.data?.length !== 0) {
      const newData = mapData(allData, locale);
      setExcelData(newData);
    }
  }, [allData, locale]);

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

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <DriverFilter
        open={openFilter}
        handleClose={handleCloseFilter}
        fetchedStatus={fetchedStatus && fetchedStatus}
        trademarksData={trademarksData && trademarksData}
        providersData={providersData && providersData}
        setFilterData={setFilterData}
        filterData={filterData}
        screenType="vehicles"
      />

      <StoreKeeperHistory
        open={openSKHistory}
        handleClose={handleCloseSKHistory}
        row={rowData}
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
            <FormattedMessage id="vehicle.vehicles" />
          </Typography>
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ ml: "16px" }} />}
            onClick={() =>
              navigate("/VehiclesFlow", {
                state: { action: "addData" },
              })
            }
          >
            <Typography variant="h3">
              <FormattedMessage id="vehicle.addNew" />
            </Typography>
          </Button>
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
                trademark: "",
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
          handleRowClick,
          pageSize,
          setPageSize,
        }}
      />
    </Box>
  );
}
