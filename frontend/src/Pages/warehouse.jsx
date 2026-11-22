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
import WarehouseFilter from "../components/Filters/wareHouseFilter";
import WarehouseMenuCell from "../components/menuCells/warehouseMenuCell";
import StoreKeeperHistory from "../components/modals/storeKeeperHistory";
import { adminOptionsFilter } from "../constants/constant";
import { isValidDate } from "../components/utils/Helper";

export default function Warehouse() {
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
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState( storedPageSize );

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
                {row?.row?.original?.providerName || "Shorex"}
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
                {row?.row?.original?.providerName || "Shorex"}
              </Typography>
            );
          },
          id: "providerName",
        },
        {
          accessorKey: "name",
          header: intl.formatMessage({ id: "warehouse.warehouseName" }),
        },
        {
          accessorKey: "storekeeperName",
          header: intl.formatMessage({ id: "warehouse.storekeeper" }),
          cell: (row) => {
            return (
              <>
                <Typography
                  color={
                    row?.row?.original?.storekeeperName === "Not assigned" &&
                    "error"
                  }
                >
                  {row?.row?.original?.storekeeperName}
                </Typography>
              </>
            );
          },
        },
        {
          accessorKey: "productsList",
          header: intl.formatMessage({ id: "warehouse.product" }),
        },
        {
          accessorKey: "availableStockList",
          header: intl.formatMessage({ id: "warehouse.availableStock" }),
        },
        {
          header: intl.formatMessage({ id: "deleteAccount.deletionRequest" }),
          accessorKey: "deletionRequestStatus",
          cell: (row) => {
            const storeKeeper = row?.row?.original?.storeKeeper;
            if (!storeKeeper?.deletionRequested) {
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
          accessorKey: "joiningDateFormat",
          header: intl.formatMessage({ id: "warehouse.joiningDate" }),
        },
        {
          cell: (row) => {
            return (
              <Box
                onClick={(e) => {
                  setRowData(row);
                  e.stopPropagation();
                }}
              >
                <WarehouseMenuCell
                  row={row}
                  getData={getData}
                  handleOpenSKHistory={handleOpenSKHistory}
                />
              </Box>
            );
          },
          id: "action",
        },
      ].filter(Boolean),
    [filterData?.adminFilter]
  );

  const handleOpenSKHistory = () => setOpenSKHistory(true);
  const handleCloseSKHistory = () => setOpenSKHistory(false);
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const [fetchedProducts, loadingProducts, getDataProducts] = useFetchedData(
    "/product?removeLanguage=true"
  );

  const [fetchedData, loading, getNewData] = useFetchedData(
    `warehouse?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [fetchedStatus, loadingState, getStatus] = useFetchedData(
    `/status?removeLanguage=true`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `warehouse?removeLanguage=true&all=true`
  );

  const [providersData, loadingProvidersData, getprovidersData] =
    useFetchedData(`/provider?removeLanguage=true&all=true`);

  const filterChips = [
    {
      key: "product",
      label: fetchedProducts?.data?.data?.find(
        (product) => product.id === filterData?.product
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
        (status) => status === filterData?.status
      )?.[locale],
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

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      storekeeperName: item.storeKeeper?.name
        ? item.storeKeeper?.name
        : "Not assigned",
      providerName: item?.provider?.name,
      productsList: item.products
        ?.map((pro) => pro?.product?.name[locale])
        .join(" - "),
      // availableStockList: item.products?.map((pro) => pro?.stock).join(" - "),
      availableStockList: item.totalStock,
      statusName: item.status,
      joiningDateFormat: item?.storeKeeper?.startAt
        ? moment(item.storeKeeper.startAt).format("Do MMM YY")
        : "Not assigned",
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `warehouse?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    search?.length > 0 && (url += `&name=${search}`);
    filterData?.product && (url += `&product=${filterData?.product}`);
    filterData?.status && (url += `&status=${filterData?.status}`);
    filterData?.adminFilter === "allProviders" && (url += `&hasProvider=true`);
    filterData?.adminFilter === "myData" && (url += `&hasNoProvider=true`);
    filterData?.adminFilter === "allData" && (url += `&allData=true`);
    filterData?.certainProvider &&
      (url += `&provider=${filterData?.certainProvider}`);
    filterData?.fromDate &&
      isValidDate(filterData?.fromDate) &&
      (url += `&fromJoiningDate=${filterData?.fromDate}`);
    filterData?.toDate &&
      isValidDate(filterData?.toDate) &&
      (url += `&toJoiningDate=${filterData?.toDate}`);
    getData(url);
  }, [
    pageIndex,
    search,
    pageSize,
    filterData?.product,
    filterData?.status,
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
  }, [fetchedData,fetchedData.data?.data?.length ,pageSize, locale]);

  useEffect(() => {
    if (allData && allData?.data?.data?.length !== 0) {
      const newData = mapData(allData, locale);
      setExcelData(newData);
    }
  }, [allData, locale]);

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
    navigate("addWarehouse", {
      state: {
        id: row?.original?.id,
        action: "viewData",
      },
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <WarehouseFilter
        open={openFilter}
        handleClose={handleCloseFilter}
        fetchedProducts={fetchedProducts && fetchedProducts}
        fetchedStatus={fetchedStatus && fetchedStatus}
        providersData={providersData && providersData}
        setFilterData={setFilterData}
        filterData={filterData}
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
            <FormattedMessage id="warehouse.warehouses" />
          </Typography>
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ ml: "16px" }} />}
            onClick={() =>
              navigate("addWarehouse", {
                state: { action: "addWarehouse" },
              })
            }
          >
            <Typography variant="h3">
              <FormattedMessage id="warehouse.addNew" />
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
        {(filterData?.product ||
          filterData?.status ||
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
                product: "",
                status: "",
                adminFilter: "",
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
