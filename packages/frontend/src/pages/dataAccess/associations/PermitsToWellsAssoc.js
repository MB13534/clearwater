import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Typography, Grid, Box, Chip } from "@material-ui/core";
import { useAuth0 } from "@auth0/auth0-react";
import useFetchData from "../../../hooks/useFetchData";
import useFormSubmitStatus from "../../../hooks/useFormSubmitStatus";
import { Flex } from "../../../components/Flex";

import FormSnackbar from "../../../components/FormSnackbar";

import SearchableList from "../../../components/SearchableList";

import WellsListForPermitsManagementTable from "./WellsListForPermitsManagementTable";
import styled from "styled-components/macro";
import AssociationControls from "./AssociationControls";

const Root = styled.div`
  margin-top: 6px;
  width: 100%;
`;

const PermitsToWellsAssoc = () => {
  const [refreshSwitch, setRefreshSwitch] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const [Permits] = useFetchData("dm-permits", [refreshSwitch]);
  const [Wells] = useFetchData(`ui-list-wells`, []);
  const [Associations] = useFetchData(`permits-to-wells`, [refreshSwitch]);

  const currentYear = new Date().getFullYear();

  const FilteredWells = useMemo(() => {
    return Wells.filter((item) => item.cuwcd_well_number[0] === "N");
  }, [Wells]);

  const FilteredAssociations = useMemo(() => {
    return Associations.filter(
      (item) => item.permit_year === currentYear && !item.removed
    );
  }, [Associations, currentYear]);

  const [activePermit, setActivePermit] = useState({});
  const [associatedWells, setAssociatedWells] = useState([]);
  const { setWaitingState, snackbarOpen, snackbarError, handleSnackbarClose } =
    useFormSubmitStatus();

  /**
   * Logic used to pre-populate the structure association checkboxes
   * with the existing associations for the active user
   * Logic runs whenever the associations data updates or whenever
   * the active user changes
   */
  useEffect(() => {
    const activeAssociations = FilteredAssociations.filter(
      (d) => activePermit.permit_ndx === d.permit_ndx
    ).map((d) => d.well_ndx);
    if (activeAssociations.length > 0 && activeAssociations[0] !== null) {
      setAssociatedWells(activeAssociations);
    } else {
      setAssociatedWells([]);
    }
  }, [FilteredAssociations, activePermit, refreshSwitch]);

  const handleRefresh = () => {
    setRefreshSwitch((state) => !state);
  };

  /**
   * Event handler for selecting a user from the users list
   * @param {object} permit selected user
   */
  const handlePermitsSelect = (permit) => {
    setAssociatedWells([]);
    setActivePermit(permit);
  };

  /**
   * Event handler for when the user checks a structure on/off
   * from the structure associations component
   */
  const handleWellsSelect = (rowData, row) => {
    const value = row.well_ndx;
    const checked = row.tableData.checked;
    setAssociatedWells((prevState) => {
      let newValues = [...prevState];
      if (checked) {
        newValues.push(+value);
      } else {
        const index = newValues.indexOf(+value);
        newValues.splice(index, 1);
      }
      return newValues;
    });
  };

  /**
   * Event handle for de-selecting all structures
   */
  const handleSelectNone = () => setAssociatedWells([]);

  /**
   * Event handler for selecting all structures
   */
  const handleSelectAll = () =>
    setAssociatedWells(FilteredWells.map((d) => d.well_ndx));

  /**
   * Utility function used to merge the active user
   * with the associated structures
   * Used to prep the data and return an object in the required
   * format for the API to update/insert associations
   */
  //

  const prepareValues = () => {
    const currentFilteredAssociations = Associations.filter(
      (fa) =>
        fa.permit_ndx === activePermit.permit_ndx &&
        fa.permit_year === currentYear
    ).map((item) => item.well_ndx);

    const currentRecords = currentFilteredAssociations.filter((item) =>
      associatedWells.includes(item)
    );

    const newRecords = associatedWells.filter(
      (item) => !currentFilteredAssociations.includes(item)
    );

    return {
      //records that currently exist that will be updated
      currentRecords: currentRecords,
      //updates that do not yet exist that will be created
      newRecords: newRecords.map((record) => {
        return {
          permit_ndx: activePermit.permit_ndx,
          permit_year: currentYear,
          well_ndx: record,
          removed: false,
          // p2w_ndx: null,
        };
      }),
    };
  };

  /**
   * Event handler for saving user/structure associations
   * to the database
   */
  const handleSubmit = () => {
    // Set up a cancellation source
    let didCancel = false;
    setWaitingState("in progress");
    async function writeData() {
      try {
        const token = await getAccessTokenSilently();

        // Create request headers with token authorization
        const headers = { Authorization: `Bearer ${token}` };

        await axios.put(
          `${process.env.REACT_APP_ENDPOINT}/api/permits-to-wells/${currentYear}/${activePermit.permit_ndx}`,
          prepareValues(),
          { headers }
        );
        if (!didCancel) {
          // Ignore if we started fetching something else
          console.log("success");
          setWaitingState("complete", "no error");
          handleRefresh();
        }
      } catch (err) {
        // Is this error because we cancelled it ourselves?
        if (axios.isCancel(err)) {
          console.log(`call was cancelled`);
        } else {
          console.error(err);
          setWaitingState("complete", "error");
        }
        didCancel = true;
      }
    }
    writeData();
  };

  return (
    <Root>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={3}>
          <SearchableList
            title="Permits"
            data={Permits}
            valueField="permit_ndx"
            primaryDisplayField="permit_number"
            secondaryDisplayField="permit_holder_name"
            tertiaryDisplayField="permitted_value"
            tooltipDisplayField="assoc_wells"
            active={activePermit}
            onClick={handlePermitsSelect}
          />
        </Grid>
        <Grid item xs={12} sm={9}>
          <Box marginTop={2} width="100%">
            <Flex>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Manage Wells Associations:
              </Typography>

              {activePermit.permit_number && (
                <Box marginTop={2} marginBottom={2} marginLeft={2}>
                  <Chip
                    label={`${activePermit.permit_number} / ${activePermit.permit_holder_name}`}
                  />
                </Box>
              )}
            </Flex>

            {activePermit.permit_number && (
              <AssociationControls
                handleSave={handleSubmit}
                handleSelectAll={handleSelectAll}
                handleSelectNone={handleSelectNone}
              />
            )}

            {activePermit.permit_number ? (
              <WellsListForPermitsManagementTable
                selections={associatedWells}
                onCheck={handleWellsSelect}
                refreshSwitch={refreshSwitch}
              />
            ) : (
              <>
                <Typography variant="body1" paragraph>
                  Select a permit from the left to associate them with wells.
                </Typography>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
      <FormSnackbar
        open={snackbarOpen}
        error={snackbarError}
        handleClose={handleSnackbarClose}
        successMessage="Associations successfully saved."
        errorMessage="Associations could not be saved."
      />
    </Root>
  );
};

export default PermitsToWellsAssoc;
