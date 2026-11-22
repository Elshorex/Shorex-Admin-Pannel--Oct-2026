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
import moment from "moment/moment";

import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import MainTable from "../components/table";
import ExportButton from "../components/ExportButton";
import { useAuthState } from "../context";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";

import StoreKeeperHistory from "../components/modals/storeKeeperHistory";
import DriverFilter from "../components/Filters/driver_vehicleFilter";
import DriverMenuCell from "../components/menuCells/DriverMenuCall";
import { adminOptionsFilter } from "../constants/constant";
import { isValidDate } from "../components/utils/Helper";

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
  const [rowData, setRowData] = useState({});

  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(storedPageSize);

  const [search, setSearch] = useState("");
  const [filterData, setFilterData] = useState(
    !providerType ? { adminFilter: "myData" } : {}
  );
  const [vehiclesData, loadingvehiclesData, getvehiclesData] = useFetchedData(
    `/vehicle?removeLanguage=true&all=true`
  );

  const [fetchedData, loading, getNewData] = useFetchedData(
    `driver?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const handleRowClick = (row) => {
    setRowData(row);
    navigate("/driverForm", {
      state: { id: row?.original?.id, action: "viewData" },
    });
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
      accessorKey: "name",
      header: intl.formatMessage({ id: "driver.driverName" }),
    },
    // {
    //   accessorKey: "email",
    //   header: intl.formatMessage({ id: "driver.email" }),
    // },
    {
      accessorKey: "vehiclesList",
      header: intl.formatMessage({ id: "driver.vehicles" }),
      cell: (row) => {
        return (
          <>
            <Typography
              color={
                row?.row?.original?.vehiclesList !== "Not assigned"
                  ? ""
                  : "error"
              }
            >
              {row?.row?.original?.vehiclesList}
            </Typography>
          </>
        );
      },
    },
    {
      accessorKey: "vehicleNumber",
      header: intl.formatMessage({ id: "driver.vehicleNumber" }),
      cell: (row) => {
        return (
          <>
            <Typography
              color={
                row?.row?.original?.vehicleNumber !== "Not assigned"
                  ? ""
                  : "error"
              }
            >
              {row?.row?.original?.vehicleNumber}
            </Typography>
          </>
        );
      },
    },
    {
      accessorKey: "joiningDateFormat",
      header: intl.formatMessage({ id: "driver.joiningDate" }),
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
      cell: (row) => (
        <Box
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DriverMenuCell
            row={row}
            getData={getData}
            handleOpenSKHistory={handleOpenSKHistory}
          />
        </Box>
      ),
      id: "action",
    },
  ].filter(Boolean),
  [filterData?.adminFilter]
  );

  const handleOpenSKHistory = () => setOpenSKHistory(true);
  const handleCloseSKHistory = () => setOpenSKHistory(false);
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const [fetchedStatus, loadingState, getStatus] = useFetchedData(
    `/status?removeLanguage=true`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `driver?removeLanguage=true&all=true`
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
      key: "vehicle",
      label: vehiclesData?.data?.data?.find(
        (vehicle) => vehicle.id === filterData?.vehicle
      )?.name,
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
      vehicleNumber: item.vehicles.length
        ? item.vehicles?.map((pro) => pro?.vehicle?.vehicleNumber).join(" - ")
        : "Not assigned",

      vehiclesList:
        item.vehicles?.length > 0
          ? item.vehicles?.map((pro) => pro?.vehicle?.name).join(" - ")
          : "Not assigned",
      statusName: item.status?.name,
      joiningDateFormat: moment(item.startAt).format("Do MMM YY"),
      endDateFormat: moment(item.enAt).format("Do MMM YY"),
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `driver?removeLanguage=true&page=${
      pageIndex + 1
    }&limit=${pageSize}`;
    search?.length > 0 && (url += `&name=${search}`);
    filterData?.vehicle && (url += `&vehicle=${filterData?.vehicle}`);
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
    filterData?.vehicle,
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
        vehiclesData={vehiclesData && vehiclesData}
        setFilterData={setFilterData}
        filterData={filterData}
        providersData={providersData && providersData}
        screenType="drivers"
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
            <FormattedMessage id="driver.drivers" />
          </Typography>
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ ml: "16px" }} />}
            onClick={() => {
              navigate("/driverForm");
            }}
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
        {(filterData?.vehicle ||
          filterData?.status ||
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
