import React, { useMemo, useState } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import { makeStyles } from "@material-ui/core/styles";
import useFetchData from "../../../hooks/useFetchData";
import { Switch } from "@lrewater/lre-react";
import { FormControlLabel } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  materialTable: {
    "& th:last-child": {
      textAlign: "left!important",
    },
  },
  toolbar: {
    paddingLeft: theme.spacing(2),
  },
  filterBtn: {
    marginTop: theme.spacing(1),
  },
}));

const Toolbar = (props) => {
  const classes = useStyles();
  const { handleChange, checked } = props;
  return (
    <div>
      <MTableToolbar {...props} />
      <div className={classes.toolbar}>
        <FormControlLabel
          control={
            <Switch
              label=""
              checked={checked}
              value="exclude"
              name="exclude"
              onChange={handleChange}
            />
          }
          label={
            checked ? (
              <>
                Toggle to view <em>all</em> wells
              </>
            ) : (
              <>
                Toggle to view only <em>selected</em> wells
              </>
            )
          }
        />
      </div>
    </div>
  );
};

const WellsListForPermitsManagementTable = ({
  selections,
  onCheck,
  refreshSwitch,
}) => {
  const classes = useStyles();
  const [exclude, setExclude] = useState(true);

  const handleExclude = () => {
    setExclude((state) => !state);
  };

  const [tableData, isLoading] = useFetchData("ui-list-wells", [refreshSwitch]);

  const FilteredTableData = useMemo(() => {
    return tableData.filter((item) => item.cuwcd_well_number[0] === "N");
  }, [tableData]);

  const columns = [
    {
      title: "CUWCD Well Number",
      field: "cuwcd_well_number",
    },
    { title: "State Well Number", field: "state_well_number" },
    { title: "Well Name", field: "well_name" },
    { title: "Source Aquifer", field: "source_aquifer" },
    { title: "Well Depth (ft)", field: "well_depth_ft" },
    { title: "Primary Well Use", field: "primary_use" },
    { title: "Current Owner", field: "well_owner" },
  ];

  const filterData = (data) => {
    if (exclude) {
      return data.filter((d) => selections.includes(d.well_ndx));
    }
    return data;
  };

  return (
    <div className={classes.materialTable}>
      <MaterialTable
        title=""
        columns={columns}
        data={filterData(FilteredTableData)}
        isLoading={isLoading}
        components={{
          Toolbar: (props) => {
            return (
              <Toolbar
                handleChange={handleExclude}
                checked={exclude}
                {...props}
              />
            );
          },
        }}
        options={{
          actionsCellStyle: { justifyContent: "center" },
          pageSize: 15,
          pageSizeOptions: [15, 30, 60],
          maxBodyHeight: 600,
          padding: "dense",
          selection: true,
          selectionProps: (rowData) => ({
            checked: selections.includes(rowData.well_ndx),
          }),
          showTextRowsSelected: false,
          showSelectAllCheckbox: false,
        }}
        onSelectionChange={onCheck}
      />
    </div>
  );
};

export default WellsListForPermitsManagementTable;
