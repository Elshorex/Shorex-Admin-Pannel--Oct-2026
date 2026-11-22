import React, { useEffect, useState } from "react";
import { MenuItem, Menu, IconButton, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";

import { usePutData } from "../../hooks/usePutData";
import ModifyPoints from "../modals/modifyPoints";
import ApproveClaim from "../modals/approveClaim";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RejectClaim from "../modals/rejectClaim";

export default function RewardsMenuCell({ row, getData, screen }) {
  const [anchorEl, setAnchorEl] = useState();
  const [openClaim, setOpenApproveClaim] = useState(false);
  const [rejectClaim, setOpenRejectClaim] = useState(false);
  const [openViewTable, setOpenViewTable] = useState(false);

  const navigate = useNavigate();

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    "/driver/updateUser",
    {},
    null,
    "error"
  );

  const getDataAndCLosemenu = async () => {
    await getData();
    setAnchorEl(null);
  };

  useEffect(() => {
    if (resultEdit?.id) {
      getDataAndCLosemenu();
      handleClose();
    }
  }, [resultEdit?.id]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <IconButton
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {screen == "ClaimRewards" && (
          <>
            <MenuItem
              onClick={() => setOpenApproveClaim(true)}
              disabled={row?.row?.original?.status != "PENDING"}
            >
              <Typography variant="h4">
                <FormattedMessage id="rewardsManagement.approveClaim" />
              </Typography>
            </MenuItem>
             <MenuItem
              onClick={() => setOpenRejectClaim(true)}
              disabled={row?.row?.original?.status != "PENDING"}
            >
              <Typography variant="h4">
                <FormattedMessage id="rewardsManagement.rejectClaim" />
              </Typography>
            </MenuItem>
          </>
        )}

        {screen === "gainedRewards" && (
          <>
            <MenuItem onClick={() => setOpenViewTable(true)}>
              <Typography variant="h4">
                <FormattedMessage id="rewardsManagement.modifyPoints" />
              </Typography>
            </MenuItem>

            <MenuItem
              onClick={() =>
                navigate(`/ViewRequestDetails`, {
                  state: { requestId: row?.row?.original?.id },
                })
              }
            >
              <Typography variant="h4">
                <FormattedMessage id="customer.viewRequests" />
              </Typography>
            </MenuItem>
          </>
        )}

        <MenuItem
          onClick={() => {
            navigate("/ViewCustomerDetails", {
              state: { customerId: row?.row?.original?.customer?.id },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="customer.customerDetails" />
          </Typography>
        </MenuItem>
      </Menu>

      <ApproveClaim
        open={openClaim}
        handleClose={() => setOpenApproveClaim(false)}
        getData={getDataAndCLosemenu}
        row={row}
      />

       <RejectClaim
        open={rejectClaim}
        handleClose={() => setOpenRejectClaim(false)}
        getData={getDataAndCLosemenu}
        row={row}
      />

      <ModifyPoints
        open={openViewTable}
        handleClose={() => setOpenViewTable(false)}
        getData={getDataAndCLosemenu}
        row={row}
      />
    </div>
  );
}
