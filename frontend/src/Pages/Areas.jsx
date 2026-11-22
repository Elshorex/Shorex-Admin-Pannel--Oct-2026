import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";

import MainTable from "../components/table";
import BasicBreadcrumbs from "../components/BasicBreadcrumbs";
import ExportButton from "../components/ExportButton";
import AddNewArea from "../components/modals/addNewAreaModal"; // ✅ You’ll need to create this
import { useFetchedData } from "../hooks/useFetchedData";
import { useLanguage } from "../hooks/useLanguage";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

const Areas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useLanguage();
  const intl = useIntl();
  const cityId = location?.state?.cityId; // ✅ areas belong to a city

  const storedPageSize =
    parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(storedPageSize);
  const [excelData, setExcelData] = useState([]);
  const [rowData, setRowData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [openAddArea, setOpenAddArea] = useState(false);
  const [openEditArea, setOpenEditArea] = useState(false);

  const handleOpenAddArea = () => setOpenAddArea(true);
  const handleCloseAddArea = () => setOpenAddArea(false);
  const handleOpenEditArea = () => setOpenEditArea(true);
  const handleCloseEditArea = () => setOpenEditArea(false);

  // ✅ Table Columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "areaName",
        header: intl.formatMessage({ id: "areas.areaName" }),
      },
      {
       accessorKey: "cityName",
       header: intl.formatMessage({ id: "areas.cityName" }),
     },
     {
       accessorKey: "stateName",
       header: intl.formatMessage({ id: "regions.stateName" }),
     },
      {
        accessorKey: "countryName",
        header: intl.formatMessage({ id: "areas.countryName" }),
      },
      {
        id: "action",
        cell: (row) => (
          <>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditArea();
                setRowData(row);
              }}
            >
              <EditIcon sx={{ fontSize: 20 }} />
            </Button>
          </>
        ),
      },
    ],
    []
  );

  // ✅ API URLs (based on cityId filter)
  let url = (cityId !== undefined ) ? `/area?city=${cityId}&removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}` : `/area?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
  let allDataUrl = (cityId !== undefined ) ? `/area?city=${cityId}&removeLanguage=true&all=true&page=${pageIndex + 1}&limit=${pageSize}` : `/area?removeLanguage=true&all=true&page=${pageIndex + 1}&limit=${pageSize}`;
   console.log(cityId,'cityId');
  const [fetchedData, loading, getNewData] = useFetchedData(url);

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    allDataUrl
  );

  const getData = (url) => {
    getNewData(url);
    search === 0 && pageIndex === 0 && getDataExcelData();
  };

  // ✅ Map API data → table
  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      areaName: item.name[locale],
      countryName: item.country?.name[locale],
      stateName: item.region?.name[locale], // ✅ comes from region
      cityName: item.city?.name[locale], // ✅ comes from city
    }));
  };

  const handleRowClick = (row) => {
    navigate(`/areas/${row.original.id}`, {
      state: { areaId: row.original.id },
    });
  };

  // Fetch data on load + search
  useEffect(() => {
    setData([]);
    search.length > 0
      ? getData(
          `/area?name=${search}&city=${cityId}&removeLanguage=true&page=${
            pageIndex + 1
          }&limit=${pageSize}`
        )
      : getData(
          // `/area?city=${cityId}&removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
          url
        );
  }, [pageIndex, search, pageSize]);

  // Update pagination
  useEffect(() => {
    if (fetchedData && fetchedData.data?.totalCount !== 0) {
      setTotalCount(fetchedData.data?.totalCount);
    }
  }, [fetchedData.data?.totalCount]);

  // Update table rows
  useEffect(() => {
    if (fetchedData && fetchedData.data?.data.length !== 0) {
      const newData = mapData(fetchedData, locale);
      setData(newData);
    }
  }, [fetchedData, fetchedData.data?.data?.length, pageSize, locale]);

  // Update Excel export data
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
      <AddNewArea
        open={openAddArea}
        handleClose={handleCloseAddArea}
        getData={getData}
        flag="add"
      />

      <AddNewArea
        open={openEditArea}
        handleClose={handleCloseEditArea}
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
            onClick={handleOpenAddArea}
          >
            <Typography variant="h3">
              <FormattedMessage id="areas.addNewArea" />
            </Typography>
          </Button>
        </Box>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", pb: "32px" }}
        >
          <FormControl variant="standard">
            <OutlinedInput
              id="input-with-icon-adornment"
              placeholder={intl.formatMessage({ id: "areas.search" })}
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
          handleRowClick,
          pageIndex,
          setPageIndex,
          loading,
          pageSize,
          setPageSize,
        }}
      />
    </Box>
  );
};

export default Areas;
