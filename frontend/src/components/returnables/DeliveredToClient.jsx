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
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment/moment";

import { useLanguage } from "../../hooks/useLanguage";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useAuthState } from "../../context";
import { isValidDate } from "../utils/Helper";
import MainTable from "../table";
import RecycleRequestFilter from "../Filters/recycleRequestFilter";
import ExportButton from "../ExportButton";

export default function DeliveredToClient() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const user = useAuthState();
  const location = useLocation()?.pathname;
  const navigate = useNavigate();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const isNotDashboard = location !== "/dashboard" && location !== "/";
  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [rowData, setRowData] = useState({});

  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(isNotDashboard ? storedPageSize : 5);

  const [search, setSearch] = useState("");
  const [filterData, setFilterData] = useState({});

  // ✅ Fetch returnables
  const [fetchedData, loading, getNewData] = useFetchedData(
    `/returnables?removeLanguage=true&status=DELIVERED_TO_CLIENT&status=CLEANING&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/returnables?removeLanguage=true&status=DELIVERED_TO_CLIENT&status=CLEANING&all=true`
  );

  const columns = React.useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "itemName",
        header: intl.formatMessage({ id: "returnable.itemName" }),
      },
      {
        accessorKey: "notes",
        header: intl.formatMessage({ id: "returnable.notes" }),
      },
      {
        accessorKey: "quantity",
        header: intl.formatMessage({ id: "returnable.quantity" }),
      },
      {
        accessorKey: "value",
        header: intl.formatMessage({ id: "returnable.value" }),
      },
      {
        accessorKey: "customerName",
        header: intl.formatMessage({ id: "returnable.customerName" }),
      },
      {
        accessorKey: "driverName",
        header: intl.formatMessage({ id: "returnable.driverName" }),
      },
       {
        accessorKey: "belongsToCustomer",
        header: intl.formatMessage({ id: "returnable.belongsToCustomer" }),
      },
      {
        accessorKey: "createdDate",
        header: intl.formatMessage({ id: "returnable.deliveredDate" }),
      },
      {
        accessorKey: "status",
        header: intl.formatMessage({ id: "returnable.status" }),
      },
    ];

    return baseColumns;
  }, [intl]);

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const getData = (url) => {
    getNewData(url);
    search?.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  const mapData = (data) => {
    return data?.data?.data?.map((item) => ({
      ...item,
      itemName: item?.itemName?.[locale] || item?.itemName?.en || "—",
      description: item?.description?.[locale] || item?.description?.en || "—",
      customerName: item?.customer?.name || "—",
      belongsToCustomer: item?.belongsToCustomer ? intl.formatMessage({ id: "Yes" }) : intl.formatMessage({ id: "No" }),
      driverName: item?.driver?.name || "—",
      createdDate: moment(item?.createdAt).format("Do MMM YY"),
    }));
  };

  useEffect(() => {
    let url = `/returnables?removeLanguage=true&status=DELIVERED_TO_CLIENT&status=CLEANING&page=${
      pageIndex + 1
    }&limit=${pageSize}&tz=${tz}`;

    search?.length > 0 && (url += `&search=${search}`);
    getData(url);
  }, [pageIndex, search, pageSize]);

  useEffect(() => {
    if (fetchedData?.data?.data?.length) {
      const newData = mapData(fetchedData);
      setData(newData);
      setTotalCount(fetchedData?.data?.totalCount || newData?.length);
    }
  }, [fetchedData]);

  useEffect(() => {
    if (allData?.data?.data?.length) {
      const newData = mapData(allData);
      setExcelData(newData);
    }
  }, [allData]);

  const handleRowClick = (row) => {
    setRowData(row);
    navigate("/ViewCustomerDetails", {
      state: { customerId: row?.original?.customer?.id },
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <RecycleRequestFilter
        open={openFilter}
        handleClose={handleCloseFilter}
        setFilterData={setFilterData}
        filterData={filterData}
        screen="DeliveredToClient"
      />

      {isNotDashboard && (
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
                placeholder={intl.formatMessage({ id: "returnable.search" })}
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
                data={excelData || []}
                columns={columns || []}
                noLastUselessColumns={1}
              />
            </Box>
          </Box>
        </Box>
      )}

      {loading && <CircularProgress />}

      <MainTable
        data={data || []}
        totalCount={totalCount}
        pageSize={pageSize}
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
