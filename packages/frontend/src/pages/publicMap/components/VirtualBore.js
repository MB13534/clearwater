import React, { useEffect, useRef, useState } from "react";
import {
  Grid as MuiGrid,
  Typography as MuiTypography,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CardContent,
  Paper,
  Chip as MuiChip,
  Divider,
} from "@material-ui/core";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { spacing } from "@material-ui/system";
import { useQuery } from "react-query";
import IconButton from "@material-ui/core/IconButton";
import { Close } from "@material-ui/icons";
import SaveRefButton from "../../../components/graphs/SaveRefButton";
import PrintRefButton from "../../../components/graphs/PrintRefButton";
import moment from "moment";
import mapboxgl from "mapbox-gl";
import { lineColors } from "../../../utils";
import { Alert, AlertTitle } from "@material-ui/lab";

const Chip = styled(MuiChip)`
  ${spacing}
  height: 20px;
  margin-top: 1px;
  margin-bottom: 1px;
  padding: 4px 0;
  font-size: 90%;
  font-weight: 790;
  background-color: ${(props) => props.rgbcolor};
  // color: ${(props) => props.theme.palette.common.white};
`;

const fadeIn = keyframes`
  from {
    transform: scale(.25);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    transform: scale(1);
    opacity: 0;
  }

  to {
    transform: scale(.25);
    opacity: 1;
  }
`;

const OuterContainer = styled(Card)`
  margin-left: 49px;
  bottom: 30px;
  z-index: 4;
  position: absolute;
  max-height: 400px;
  width: calc(100% - 49px - 49px);
  visibility: ${({ open }) => (open ? "visible" : "hidden")};
  animation: ${({ open }) => (open ? fadeIn : fadeOut)} 0.5s linear;
  transition: visibility 0.5s linear;
  overflow-y: auto;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
`;

const CloseContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

const Grid = styled(MuiGrid)(spacing);
const Typography = styled(MuiTypography)(spacing);

const VirtualBore = ({
  open = false,
  coordinates,
  onClose,
  map,
  setCoordinates,
}) => {
  const divSaveRef = useRef(null);
  const [marker] = useState(
    new mapboxgl.Marker({
      draggable: false,
      color: lineColors.maroon,
    })
  );

  const { data } = useQuery(
    ["UiVirtualBoreDataRecords", coordinates],
    async () => {
      if (!coordinates || !open) return;
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/ui-virtual-bore-data-records/${coordinates.lat}/${coordinates.lon}`
        );
        return data;
      } catch (err) {
        console.error(err);
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (open && coordinates) {
      marker.setLngLat([coordinates.lon, coordinates.lat]).addTo(map);
    } else {
      setCoordinates(null);
      marker.remove();
    }
  }, [coordinates, open]); //eslint-disable-line

  const geologicUnitColors = {
    "Del Rio, Georgetown, Main Street & Paw Paw Limestone": "#E8BA6C",
    "Glen Rose": "#99DEF5",
    "Austin Chalk": "#94CE94",
    "Pearsall & Hammett Shale": "#DFE094",
    Hosston: "#403ECD",
    Walnut: "#097608",
    "Edwards & Commanche Peak Limestone": "#C5FBC7",
    "Hensell & Cow Creek Limestone": "#C454C4",
  };

  const Centered = ({ children }) => {
    return <div style={{ textAlign: "center" }}>{children}</div>;
  };

  return (
    <>
      {Boolean(data) && (
        <OuterContainer bgcolor="#ffffff" open={open}>
          <CloseContainer>
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          </CloseContainer>
          <Grid container mr={10} mt={1}>
            <Grid
              item
              style={{
                flexGrow: 1,
                maxWidth: "calc(100% - 150px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            />
            <Grid
              item
              style={{
                display: "flex",
                alignItems: "flex-end",
              }}
              mb={1}
            >
              <PrintRefButton
                data-html2canvas-ignore
                ref={divSaveRef}
                title="Virtual Bore"
              />
              <SaveRefButton
                data-html2canvas-ignore
                ref={divSaveRef}
                title="Virtual Bore"
              />
            </Grid>
          </Grid>
          <Paper ref={divSaveRef}>
            <CardContent style={{ width: "100%" }}>
              <Centered>
                <Grid container justify={"space-between"} alignItems={"center"}>
                  <Grid item xs={3} style={{ textAlign: "center" }}>
                    <img
                      src="/static/img/clearwater-logo-full.png"
                      width="150px"
                      alt={"Clearwater Underground Water Conservation District"}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h1" style={{ fontWeight: 400 }}>
                      CUWCD Virtual Bore
                    </Typography>
                    <Typography variant="subtitle2" mb={1}>
                      Created: {moment().format("MMMM Do YYYY, h:mma")}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} style={{ textAlign: "right" }} />
                </Grid>
              </Centered>
              <Divider style={{ marginBottom: "8px" }} />

              <Grid container spacing={6} mb={1}>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item xs={2}>
                      <Typography variant="subtitle1" align="right" mr={2}>
                        <strong>Latitude: </strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="subtitle1" align="left">
                        <Chip
                          variant="outlined"
                          color="primary"
                          label={coordinates.lat.toFixed(6)}
                        />
                      </Typography>
                    </Grid>
                    <Grid item xs={4} />
                    <Grid item xs={4}>
                      <Typography variant="subtitle1" align="center">
                        <strong>Approximate Ground Surface Elevation: </strong>
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container alignItems="center">
                    <Grid item xs={2}>
                      <Typography variant="subtitle1" align="right" mr={2}>
                        <strong>Longitude: </strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="subtitle1" align="left">
                        <Chip
                          variant="outlined"
                          color="primary"
                          label={coordinates.lon.toFixed(6)}
                        />
                      </Typography>
                    </Grid>

                    <Grid item xs={4} />
                    <Grid item xs={4}>
                      <Typography variant="subtitle1" align="center">
                        <Chip
                          variant="outlined"
                          color="primary"
                          label={data[0]?.surface_elev || "N/A"}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Divider style={{ marginBottom: "8px" }} />
              <TableContainer>
                {data.length ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">
                          <strong>Top Elev. (ft)</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Bottom Elev. (ft)</strong>
                        </TableCell>
                        <TableCell align="center"> </TableCell>
                        <TableCell align="center">
                          <strong>Depth to Formation (ft)*</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Formation Thickness (ft)*</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Formation (Geologic Unit)</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell align="center">{row.top_elev}</TableCell>
                          <TableCell align="center">
                            {row.bottom_elev}
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor:
                                geologicUnitColors[row.geologic_unit],
                            }}
                          ></TableCell>
                          <TableCell align="center">
                            {row.depth_to_formation}
                          </TableCell>
                          <TableCell align="center">
                            {row.formation_thickness}
                          </TableCell>
                          <TableCell align="center">
                            {row.geologic_unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    <strong>
                      **There is no data available for these coordinates.** —{" "}
                    </strong>
                    please try again!
                  </Alert>
                )}
              </TableContainer>
              <Typography mt={2} mb={2}>
                *Depths / Thicknesses are not to scale
              </Typography>
              <Typography variant="body2">
                <strong>Disclaimer: </strong> This product is for informational
                purposes only and has not been prepared for or suitable for
                legal, engineering, or other purposes. All representations in
                this virtual bore represent only the approximate relative depths
                and thicknesses based on geological interpretation and
                extrapolation of available well data. Additional data may modify
                one or more of these formation surfaces. The Clearwater
                Underground Water Conservation District expressly disclaims any
                and all liability in connection herewith.
              </Typography>
            </CardContent>
          </Paper>
        </OuterContainer>
      )}
    </>
  );
};

export default VirtualBore;
