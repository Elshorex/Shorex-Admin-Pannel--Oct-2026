import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

function BasicBreadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbItems = {
    "/countries": [<FormattedMessage id="countries.countries" />],
    "/cities": [
      // <FormattedMessage id="countries.countries" />,
      <FormattedMessage id="cities.cities" />,
    ],
    "/regions": [
      // <FormattedMessage id="countries.countries" />,
      // <FormattedMessage id="cities.cities" />,
      <FormattedMessage id="regions.states" />,
    ],
  };

  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const matchedRoute = Object.keys(breadcrumbItems).find((route) =>
      location.pathname.includes(route)
    );

    if (matchedRoute) {
      const matchedBreadcrumbs = breadcrumbItems[matchedRoute];
      setBreadcrumbs(matchedBreadcrumbs);
    } else {
      setBreadcrumbs([]);
    }
  }, [location.pathname]);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: "22px" }}>
      {breadcrumbs.map((item, index) => (
        <span key={index}>
          {index < breadcrumbs.length - 1 ? (
            <Typography variant="h2">
              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigate(index - breadcrumbs.length + 1)}
                sx={{ cursor: "pointer" }}
              >
                {item}
              </Link>
            </Typography>
          ) : (
            <Typography variant="h2">
              <span>{item}</span>
            </Typography>
          )}
        </span>
      ))}
    </Breadcrumbs>
  );
}

export default BasicBreadcrumbs;
