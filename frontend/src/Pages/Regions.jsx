import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation } from "react-router-dom";

import MainTable from "../components/table";
import ExportButton from "../components/ExportButton";
import BasicBreadcrumbs from "../components/BasicBreadcrumbs";
import AddNewRegion from "../components/modals/addNewRegionModal";
import { useFetchedData } from "../hooks/useFetchedData";
import { useLanguage } from "../hooks/useLanguage";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

export default function Regions() {
  const { locale } = useLanguage();
  const location = useLocation();
  const intl = useIntl();
  const cityId = location?.state?.cityId;
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const columns = useMemo(
    () => [
      {
        accessorKey: "regionName",
        header: intl.formatMessage({ id: "regions.stateName" }),
      },
      // {
      //   accessorKey: "cityName",
      //   header: intl.formatMessage({ id: "regions.cityName" }),
      // },
      {
        accessorKey: "countryName",
        header: intl.formatMessage({ id: "regions.countryName" }),
      },
      // {
      //   accessorKey: "postalCode",
      //   header: intl.formatMessage({ id: "customer.postalCode" }),
      // },
      // {
      //   accessorKey: "latitude",
      //   header: intl.formatMessage({
      //     id: "regions.geographicalLatitude",
      //   }),
      // },
      // {
      //   accessorKey: "longitude",
      //   header: intl.formatMessage({
      //     id: "regions.geographicalLongitude",
      //   }),
      // },
      {
        id: "action",
        cell: (row) => (
          <>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditRegion();
                setRowData(row);
              }}
            >
              <EditIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </Button>
          </>
        ),
      },
    ],
    []
  );

  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [pageSize, setPageSize] = useState(storedPageSize);

  const [rowData, setRowData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");

  const [openAddRegion, setOpenAddRegion] = useState(false);
  const [openEditRegion, setOpenEditRegion] = useState(false);

  const handleOpenAddRegion = () => setOpenAddRegion(true);
  const handleCloseAddRegion = () => setOpenAddRegion(false);
  const handleOpenEditRegion = () => setOpenEditRegion(true);
  const handleCloseEditRegion = () => setOpenEditRegion(false);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `/region?city=${cityId}&removeLanguage=true&page=${
      pageIndex + 1
    }&limit=${pageSize}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/region?removeLanguage=true&all=true`
  );

  //enhance it not to fetch the all data
  const getData = (url) => {
    getNewData(url);
    search.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      regionName: item?.name[locale],
      // cityName: item?.city.name[locale],
      countryName: item?.country.name[locale],
    }));
  };

  useEffect(() => {
    setData([]);
    search.length > 0
      ? getData(
          `/region?name=${search}&city=${cityId}&removeLanguage=true&page=${
            pageIndex + 1
          }&limit=${pageSize}`
        )
      : getData(
          `/region?city=${cityId}&removeLanguage=true&page=${
            pageIndex + 1
          }&limit=${pageSize}`
        );
  }, [pageIndex, search, pageSize]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.totalCount !== 0) {
      setTotalCount(fetchedData.data?.totalCount);
    }
  }, [fetchedData.data?.totalCount]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.data.length !== 0) {
      const newData = mapData(fetchedData, locale);
      setData(newData);
    }
  }, [fetchedData,fetchedData.data?.data?.length, pageSize, locale]);

  useEffect(() => {
    if (allData && allData?.data?.data.length !== 0) {
      const newData = mapData(allData, locale);
      setExcelData(newData);
    }
  }, [allData, locale]);

  return (
    <Box
      sx={{
        width: "100%",
        p: "32px",
      }}
    >
      <AddNewRegion
        open={openAddRegion}
        handleClose={handleCloseAddRegion}
        getData={getData}
        flag="add"
      />

      <AddNewRegion
        open={openEditRegion}
        handleClose={handleCloseEditRegion}
        getData={getData}
        flag="edit"
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
          <BasicBreadcrumbs />
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpenAddRegion}
          >
            <Typography variant="h3">
              <FormattedMessage id="regions.addNewState" />
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

          <ExportButton
            loadingExcelData={loadingExcelData}
            data={excelData ? excelData : []}
            columns={columns ? columns : []}
            noLastUselessColumns={1}
          />
        </Box>
      </Box>
      <MainTable
        data={data ? data : []}
        totalCount={totalCount}
        {...{
          columns,
          pageIndex,
          setPageIndex,
          loading,
          pageSize,
          setPageSize,
        }}
      />
    </Box>
  );
}
