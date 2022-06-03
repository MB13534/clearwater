import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
  Tooltip,
  ListItemIcon,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import SortIcon from "@material-ui/icons/SortByAlpha";
import UpIcon from "@material-ui/icons/ArrowDropUp";
import DownIcon from "@material-ui/icons/ArrowDropDown";
import { Flex } from "../../components/Flex";
import { Droplet } from "react-feather";

const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    width: 35,
    height: 35,
    fontSize: 15,
  },
  formControl: {
    margin: theme.spacing(1),
    width: "100%",
  },
  search: {
    width: "100%",
  },
  list: {
    overflowY: "scroll",
    maxHeight: 700,
  },
}));

const SearchableList = ({
  data = [],
  valueField,
  primaryDisplayField,
  secondaryDisplayField,
  tertiaryDisplayField,
  tooltipDisplayField,
  title,
  active = {},
  onClick = () => {},
}) => {
  const classes = useStyles();
  const [searchText, setSearchText] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  if (data.length === 0) {
    return (
      <Box marginTop={2}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1">No Data Found</Typography>
      </Box>
    );
  }

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchText(value);
  };

  const handleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <Box marginTop={2} width="100%">
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Flex>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel htmlFor="search">Search</InputLabel>
          <OutlinedInput
            autoComplete="off"
            id="search"
            value={searchText}
            onChange={handleSearch}
            label="Search"
            className={classes.search}
            endAdornment={
              <InputAdornment position="end">
                <IconButton aria-label="search">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <Flex justifyContent="start">
          <Tooltip title="Sort by Permit Name">
            <IconButton onClick={handleSortDirection}>
              <SortIcon color="primary" size="large" />
            </IconButton>
          </Tooltip>
          {sortDirection === "asc" ? (
            <UpIcon size="small" color="disabled" />
          ) : (
            <DownIcon size="small" color="disabled" />
          )}
        </Flex>
      </Flex>

      <List className={classes.list}>
        {data
          .filter(
            (record) =>
              record[primaryDisplayField]
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
              record[secondaryDisplayField]
                .toString()
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
              (record[tooltipDisplayField] &&
                record[tooltipDisplayField]
                  .join(",")
                  .toLowerCase()
                  .includes(searchText.toLowerCase()))
          )
          .sort((a, b) => {
            if (sortDirection === "asc") {
              if (a[primaryDisplayField] < b[primaryDisplayField]) {
                return -1;
              }
              if (a[primaryDisplayField] > b[primaryDisplayField]) {
                return 1;
              }
              return 0;
            } else {
              if (a[primaryDisplayField] > b[primaryDisplayField]) {
                return -1;
              }
              if (a[primaryDisplayField] < b[primaryDisplayField]) {
                return 1;
              }
              return 0;
            }
          })
          .map((record) => (
            <Tooltip
              title={
                record[tooltipDisplayField]
                  ? record[tooltipDisplayField].map((item) => {
                      return (
                        <ListItem key={item}>
                          <ListItemIcon>
                            <Droplet />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      );
                    })
                  : ""
              }
              key={record[primaryDisplayField]}
              arrow
              placement="bottom"
            >
              <ListItem
                button
                selected={
                  record[primaryDisplayField] === active[primaryDisplayField]
                }
                onClick={() => onClick(record)}
              >
                <ListItemAvatar>
                  <Avatar className={classes.avatar}>
                    {record[primaryDisplayField].charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={record[primaryDisplayField]}
                  secondary={
                    <>
                      {record[secondaryDisplayField]}
                      <br />
                      {record[tertiaryDisplayField]} (af)
                    </>
                  }
                />
              </ListItem>
            </Tooltip>
          ))}
      </List>
    </Box>
  );
};

SearchableList.propTypes = {
  /**
   * Title to display above the list
   */
  title: PropTypes.string.isRequired,
  /**
   * Data to display in a searchable list.
   * Expects an array of objects.
   */
  data: PropTypes.array.isRequired,
  /**
   * Name of the field that contains the internal value
   * i.e. the index field in a list table
   */
  valueField: PropTypes.string.isRequired,
  /**
   * Name of the field that contains the display value
   * i.e. the description field in a list table
   */
  primaryDisplayField: PropTypes.string.isRequired,
  /**
   * Object representing the currently selected list value
   */
  active: PropTypes.object,
  /**
   * Event handler for when the user selects a list item
   */
  onClick: PropTypes.func,
};

export default SearchableList;
