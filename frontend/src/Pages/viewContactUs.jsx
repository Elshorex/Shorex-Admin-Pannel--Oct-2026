import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import ContactUsModal from "../components/modals/ContactUsModal";
import { useFetchedData } from "../hooks/useFetchedData";
import { useLanguage } from "../hooks/useLanguage";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ContactUs = () => {
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const intl = useIntl();
  const storedPageSize =
    parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(storedPageSize);
  const [totalCount, setTotalCount] = useState(0);

  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [isEditFlag, setIsEditFlag] = useState(false);

  const handleOpenAdd = () => {
    setRowData(null);
    setIsEditFlag(false);
    setOpenAddEdit(true);
  };
  const handleOpenEdit = (row) => {
    setRowData(row?.row?.original);
    setIsEditFlag(true);
    setOpenAddEdit(true);
  };
  const handleCloseModal = () => setOpenAddEdit(false);

  // URL for list and excel export
  const listUrl = `/contact-us?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
  const excelUrl = `/contact-us?removeLanguage=true&all=true`;

  const [fetchedData, loading, getNewData] = useFetchedData(listUrl);
  const [allData, loadingExcelData, getDataExcelData] =
    useFetchedData(excelUrl);

  
  const [deleteResult, deleteLoading, callDelete] = (function placeholder() {
    return [null, false, async (url) => {
      await fetch(url, { method: "DELETE" });
      // no-op, Consumer will call getData()
    }];
  })();

  const getData = (url) => {
    getNewData(url);
    if (!search && pageIndex === 0) getDataExcelData();
  };

  // const columns = useMemo(
  //   () => [
  //     {
  //       accessorKey: "email",
  //       header: intl.formatMessage({ id: "driver.email" }),
  //     },
  //     {
  //       accessorKey: "phoneNumber",
  //       header: intl.formatMessage({ id: "driver.mobileNumber" }),
  //     },
  //     {
  //       accessorKey: "whatsapp",
  //       header: intl.formatMessage({ id: "contactUs.whatsapp" }),
  //     },
  //     {
  //       accessorKey: "telegram",
  //       header: intl.formatMessage({ id: "contactUs.telegram" }),
  //     },
  //     {
  //       id: "action",
  //       cell: (row) => (
  //         <>
  //           <Button
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               handleOpenEdit(row);
  //             }}
  //           >
  //             <EditIcon sx={{ fontSize: 20 }} />
  //           </Button>
  //           <Button
  //             onClick={async (e) => {
  //               e.stopPropagation();
  //               if (
  //                 !window.confirm(
  //                   intl.formatMessage({ id: "common.confirmDelete" })
  //                 )
  //               )
  //                 return;
  //               await callDelete(`/contact-us/${row.original.id}`);
  //               // refresh
  //               getData(listUrl);
  //             }}
  //           >
  //             <DeleteIcon sx={{ fontSize: 20 }} />
  //           </Button>
  //         </>
  //       ),
  //     },
  //   ],
  //   []
  // );
const columns = useMemo(
  () => [
     {
      accessorKey: "countryName",
      header: intl.formatMessage({ id: "regions.countryName" }), // show localized label
    },
    {
      accessorKey: "email",
      header: intl.formatMessage({ id: "driver.email" }),
    },
    {
      accessorKey: "phoneNumber",
      header: intl.formatMessage({ id: "driver.mobileNumber" }),
    },
    {
      accessorKey: "whatsapp",
      header: intl.formatMessage({ id: "contactUs.whatsapp" }),
    },
    {
      accessorKey: "telegram",
      header: intl.formatMessage({ id: "contactUs.telegram" }),
    },
   
    {
      id: "action",
      cell: (row) => (
        <>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
          >
            <EditIcon sx={{ fontSize: 20 }} />
          </Button>
          <Button
            onClick={async (e) => {
              e.stopPropagation();
              if (
                !window.confirm(
                  intl.formatMessage({ id: "common.confirmDelete" })
                )
              )
                return;
              await callDelete(`/contact-us/${row.original.id}`);
              getData(listUrl);
            }}
          >
            <DeleteIcon sx={{ fontSize: 20 }} />
          </Button>
        </>
      ),
    },
  ],
  []
);

  const mapData = (data, locale) => {
    return data?.data?.data?.map((item) => ({
      ...item,
      email: item.email,
      phoneNumber: item.phoneNumber,
      whatsapp: item.whatsapp || "___",
      telegram: item.telegram || "___",
       countryName: item.country?.name?.[locale] || "___", // <-- added
      updatedAt: item.updatedAt,
    }));
  };

  useEffect(() => {
    setData([]);
    let url;
    if (search && search.length > 0) {
      url = `/contact-us?name=${encodeURIComponent(
        search
      )}&removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    } else {
      url = `/contact-us?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    }
    getData(url);
  }, [pageIndex, search, pageSize]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.totalCount !== undefined) {
      setTotalCount(fetchedData.data?.totalCount);
    }
  }, [fetchedData?.data?.totalCount]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.data?.length !== 0) {
      setData(mapData(fetchedData, locale));
    }
  }, [fetchedData, pageSize, locale]);

  useEffect(() => {
    if (allData && allData.data?.data?.length !== 0) {
      setExcelData(mapData(allData, locale));
    }
  }, [allData, locale]);

  const handleRowClick = (row) => {
    // optionally open edit or navigate
    handleOpenEdit(row.original);
  };

  return (
    <Box sx={{ width: "100%", p: "32px" }}>
      <ContactUsModal
        open={openAddEdit}
        handleClose={handleCloseModal}
        getData={() => getData(listUrl)}
        row={rowData}
        isEdit={isEditFlag}
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
            onClick={handleOpenAdd}
          >
            <Typography variant="h3">
              <FormattedMessage id="contactUs.addNew" />
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
            data={excelData || []}
            columns={columns || []}
            noLastUselessColumns={1}
          />
        </Box>
      </Box>

      <MainTable
        data={data || []}
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

export default ContactUs;
