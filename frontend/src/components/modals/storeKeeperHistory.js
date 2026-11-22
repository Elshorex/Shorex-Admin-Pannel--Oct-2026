import React, { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import moment from "moment";
import { CircularProgress, Typography } from "@mui/material";

import { useFetchedData } from "../../hooks/useFetchedData";
import BasicModal from "./basicModal";
import MainTable from "../table";

export default function StoreKeeperHistory({
  open,
  handleClose,
  flag,
  row = {},
}) {
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [pageIndex, setPageIndex] = useState(0);
  const [currentData, setCurrentData] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(storedPageSize);

  const [
    fetchedStorekeeperHistory,
    loadingStorekeeperHistory,
    getStorekeeperHistory,
  ] = useFetchedData(
    `/storekeeper-history?warehouse=${row?.row?.original?.id}&removeLanguage=true`,
    false
  );

  const [fetchedDriver, loadingDriver, getDriver] = useFetchedData(
    `/vehicle-history/?vehicle=${row?.row?.original?.id}`,
    false
  );

  useEffect(() => {
    if (open) {
      if (flag === "StoreKeeperHistory") {
        getStorekeeperHistory();
      } else if (flag === "DriverHistory") {
        getDriver();
      }
    }
  }, [open, flag]);

  useEffect(() => {
    const mapData = (data) => {
      return data?.data?.data?.map((item) => ({
        ...item,
        name: item.driver.name,
        email: item.driver.email,
        joiningDateFormat: moment(item.startAt).format("Do MMM YY"),
        endDateFormat: moment(item.endAt).format("Do MMM YY"),
      }));
    };

    const mapDataStorekeeper = (data) => {
      return data?.data?.data?.map((item) => ({
        ...item,
        name: item?.name,
        email: item?.email,
        joiningDateFormat: moment(item?.startAt).format("Do MMM YY"),
        endDateFormat: moment(item?.endAt).format("Do MMM YY"),
      }));
    };

    if (
      fetchedDriver?.data?.data?.length > 0 ||
      fetchedStorekeeperHistory?.data?.data.length > 0
    ) {
      const currentResponse =
        flag === "StoreKeeperHistory"
          ? mapDataStorekeeper(fetchedStorekeeperHistory)
          : mapData(fetchedDriver);
      setCurrentData(currentResponse);
    }
  }, [
    fetchedDriver?.data?.data?.length,
    fetchedStorekeeperHistory?.data?.data.length,
    flag,
  ]);

  useEffect(() => {
    if (currentData && currentData.data?.totalCount !== 0) {
      setTotalCount(currentData?.data?.totalCount);
    }
  }, [currentData?.data?.totalCount]);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: intl.formatMessage({ id: "warehouse.name" }),
      },
      {
        accessorKey: "email",
        header: intl.formatMessage({ id: "warehouse.email" }),
      },
      {
        accessorKey: "joiningDateFormat",
        header: intl.formatMessage({ id: "warehouse.joiningDate" }),
      },
      {
        accessorKey: "endDateFormat",
        header: intl.formatMessage({ id: "warehouse.endDate" }),
      },
    ],
    []
  );

  return (
    <>
      <BasicModal
        open={open}
        handleClose={handleClose}
        title={
          <Typography variant="h3">
            {flag == "StoreKeeperHistory" ? (
              <>
                {row?.row?.original?.storekeeperName != "Not assigned"
                  ? row?.row?.original?.storekeeperName
                  : ""}
                <FormattedMessage id="warehouse.storekeeperHistory" />
              </>
            ) : (
              <FormattedMessage id="vehicle.viewDriversHistory" />
            )}
            {(loadingDriver || loadingStorekeeperHistory) && (
              <CircularProgress />
            )}
          </Typography>
        }
        sx={{
          "& .css-hz1bth-MuiDialog-container": {
            width: "800px",
          },
          "& .css-1q9dwy8-MuiPaper-root-MuiDialog-paper": {
            maxWidth: "800px",
          },
        }}
      >
        <MainTable
          data={currentData ? currentData : []}
          totalCount={totalCount}
          {...{ columns, pageIndex, setPageIndex, pageSize, setPageSize }}
        />
      </BasicModal>
    </>
  );
}
