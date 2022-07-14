import React, { useMemo, useState } from "react";
import {
  Box,
  Checkbox,
  IconButton,
  List as MuiList,
  ListItem as MuiListItem,
  ListItemText,
  ListItemSecondaryAction,
  Slider,
  Typography as MuiTypography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";

import ExpandMore from "@material-ui/icons/ExpandMore";
import ChevronRight from "@material-ui/icons/ChevronRight";
import styled from "styled-components/macro";
import { spacing } from "@material-ui/system";
import { Label } from "@material-ui/icons";
import MuiButton from "@material-ui/core/Button";
import { customSecondary } from "../../../../theme/variants";

const SidebarSection = styled(MuiTypography)`
  ${spacing}
  color: ${() => customSecondary[500]};
  padding: ${(props) => props.theme.spacing(1)}px
    ${(props) => props.theme.spacing(5)}px
    ${(props) => props.theme.spacing(0)}px;
  opacity: 0.9;
  font-weight: ${(props) => props.theme.typography.fontWeightBold};
  display: block;
`;

const List = styled(MuiList)(spacing);
const Typography = styled(MuiTypography)(spacing);
const Button = styled(MuiButton)(spacing);
const ListItem = styled(MuiListItem)`
  padding-top: 0;
  padding-bottom: 0;
`;

/**
 * Utility used to translate a Mapbox paint style
 * into an array of legend items
 * Currently only setup to support a basic fill color and
 * the 'match' flavor of Mapbox Expressions/data driven styling
 * Reference https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#match
 * @param {object} layer Mapbox layer representation
 * @returns
 */
const getLegendOptions = (layer) => {
  /**
   * Get the proper object property and color associated with the layer
   * based on the layer type
   */
  const colorProperty = `${layer?.type}-color`;
  const color = layer?.paint?.[colorProperty];

  /**
   * If it is just a standard color rule (i.e. no data driven styling), just
   * grab the color,
   * Otherwise, if we are using Mapbox expressions/data-driven styling we need
   * to parse the paint property and convert it into an array of legend
   * items
   */
  if (!Array.isArray(color)) {
    return [{ color, text: layer.name }];
  }

  const colorsExpression = [...color];

  let legendOptions;

  if (colorsExpression[0] === "case") {
    // remove some unused parts of the expression
    colorsExpression.splice(0, 1);

    legendOptions = colorsExpression
      .map((value, index) => {
        if (index < colorsExpression.length - 1 && index % 2 === 0) {
          return {
            color: colorsExpression[index + 1],
            text: Array.isArray(value)
              ? (index > 1 ? colorsExpression[index - 2][2] : 0) +
                (index >= colorsExpression.length - 3
                  ? "+"
                  : " - " + value[2]) +
                " in"
              : value,
            // text: Array.isArray(value)
            //   ? (index > 1 ? colorsExpression[index - 2][2] : "") +
            //     (index >= colorsExpression.length - 3
            //       ? "+"
            //       : " " + value[0] + " " + value[2]) +
            //     " in"
            //   : value,
          };
        }
        return null;
      })
      .filter((d) => d !== null);
  } else {
    // remove some unused parts of the expression
    colorsExpression.splice(0, 2);

    /**
     * Loop through the mapbox expression and pull out the color and the
     * category it is associated with
     * The expression that is being parsed is in a format like
     * [["Industrial"], "#1f78b4", ["Ag/Irrigation"],"#b2df8a"]
     * so even odd indexes in the array represent categories and even number
     * indexes represent the associated color
     * As a result we have to loop through the expression and merge
     * two items into a single one
     */
    legendOptions = colorsExpression
      .map((value, index) => {
        if (index < colorsExpression.length - 1 && index % 2 === 0) {
          return {
            color: colorsExpression[index + 1],
            text: Array.isArray(value) ? value?.join(", ") : value,
          };
        }
        return null;
      })
      .filter((d) => d !== null);
  }

  // grab the fallback value (i.e. what is used if a feature doesn't match any category)
  const fallbackValue = colorsExpression.splice(colorsExpression.length - 1, 1);
  // Add the fallback value to the end of array
  legendOptions.push({ color: fallbackValue, text: "N/A Value" });
  return legendOptions;
};

const LegendSymbol = ({ color }) => (
  <Box
    bgcolor={color}
    borderRadius="50%"
    height={12}
    width={12}
    style={{ minWidth: "12px" }}
  />
);

const LayerLegendIcon = ({ open }) =>
  open ? <ExpandMore /> : <ChevronRight />;

const handleSliderChange = (event, newValue, item, onOpacityChange) => {
  const itemId = item.id;

  onOpacityChange({
    id: itemId,
    opacity: parseInt(newValue, 10) / 100,
  });
};

const LayerSlider = ({ item, onOpacityChange }) => {
  const layerFillOpacity =
    item?.type === "fill" &&
    (item?.paint["fill-opacity"] === 0 || item?.paint["fill-opacity"])
      ? item?.paint["fill-opacity"]
      : null;

  return layerFillOpacity || layerFillOpacity === 0 ? (
    <Box mb={-2}>
      <SidebarSection id="fill-opacity">Fill Opacity</SidebarSection>
      <Slider
        valueLabelDisplay="auto"
        value={+(item.paint["fill-opacity"] * 100).toFixed(0)}
        onChange={(event, newValue) =>
          handleSliderChange(event, newValue, item, onOpacityChange)
        }
        aria-labelledby="continuous-slider"
      />
    </Box>
  ) : null;
};

const handleBooleanChange = (
  event,
  newValue,
  item,
  filterField,
  onBooleanChange,
  setValue
) => {
  setValue(newValue);

  onBooleanChange({
    filterField: filterField,
    value: newValue,
  });
};

const BooleanToggle = ({ item, onBooleanChange, value, setValue }) => {
  const booleanToggle = item?.lreProperties?.booleanToggle || false;

  if (booleanToggle) {
    const [field, labels, title] = booleanToggle;

    return (
      <List disablePadding key={field}>
        <RadioGroup
          aria-label="data"
          name="data"
          value={value}
          onChange={(event, newValue) =>
            handleBooleanChange(
              event,
              newValue,
              item,
              field,
              onBooleanChange,
              setValue
            )
          }
        >
          <SidebarSection>{title}</SidebarSection>

          <ListItem style={{ marginTop: "4px", paddingLeft: 0 }}>
            <FormControlLabel
              value="all"
              control={<Radio />}
              label={labels["all"]}
            />
          </ListItem>
          <ListItem style={{ paddingLeft: 0 }}>
            <FormControlLabel
              value="true"
              control={<Radio />}
              label={labels["true"]}
            />
          </ListItem>

          <ListItem style={{ paddingLeft: 0 }}>
            <FormControlLabel
              value="false"
              control={<Radio />}
              label={labels["false"]}
            />
          </ListItem>
        </RadioGroup>
      </List>
    );
  }

  return null;
};

const LayerLegend = ({
  item,
  open,
  onOpacityChange,
  onBooleanChange,
  value,
  setValue,
  handleVisibilityChange,
  items,
}) => {
  if (!open) return null;
  const legendItems = getLegendOptions(item);
  return (
    <>
      <Box display="flex" flexDirection="column" gridRowGap={4} mb={2} mx={11}>
        {legendItems.map(({ color, text }) => (
          <Box
            className="print-legend"
            key={text}
            display="flex"
            alignItems="center"
            gridColumnGap={8}
          >
            <LegendSymbol color={color} />
            <Typography color="textSecondary" variant="body2">
              {text}
            </Typography>
          </Box>
        ))}

        <BooleanToggle
          item={item}
          onBooleanChange={onBooleanChange}
          value={value}
          setValue={setValue}
        />
        {items.find(
          (layer) =>
            layer?.lreProperties?.layerGroup ===
              item.lreProperties?.layerGroup && layer.lreProperties?.labelGroup
        ) && (
          <Button
            // mt={1}
            startIcon={<Label color="primary" />}
            variant="outlined"
            size="small"
            onClick={() => {
              handleVisibilityChange(
                items.find(
                  (layer) =>
                    layer?.lreProperties?.layerGroup ===
                      item.lreProperties?.layerGroup &&
                    layer.lreProperties?.labelGroup
                )
              );
            }}
          >
            Toggle Labels
          </Button>
        )}
        <LayerSlider item={item} onOpacityChange={onOpacityChange} />
      </Box>
    </>
  );
};

/**
 * TODOS
 * [] Add support for layers search
 */
const LayersControl = ({
  items,
  onLayerChange,
  onOpacityChange,
  onBooleanChange,
}) => {
  const [expandedItems, setExpandedItems] = useState([
    "Clearwater Wells",
    "Search Circle Radius",
  ]);

  const [value, setValue] = useState("all");

  /**
   * Generate a unique list of items to display in the layer
   * controls list
   * This approach allows us to represent grouped layers with a single
   * item in the list while still controlling the visibility values for
   * all of the associated grouped layers
   */
  const uniqueItems = useMemo(() => {
    const uniqueItemIds = [
      ...new Set(
        items.map((item) => {
          return item?.lreProperties?.layerGroup || item.id;
        })
      ),
    ];

    return uniqueItemIds.reduce((acc, curr) => {
      const match = items.find((item) => {
        const id = item?.lreProperties?.layerGroup || item.id;
        return id === curr;
      });
      acc.push(match);
      return acc;
    }, []);
  }, [items]);

  /**
   * Handler that controls the visibility of each layer group
   */
  const handleVisibilityChange = (item) => {
    const itemId =
      item?.lreProperties?.labelGroup ||
      (item?.lreProperties?.labelGroup && item.type === "symbol")
        ? item?.lreProperties?.labelGroup
        : item?.lreProperties?.layerGroup || item.id;

    onLayerChange({
      id: itemId,
      visible: item?.layout?.visibility === "none",
    });
  };

  /**
   * Handler used to control the expanded/collapsed state of the
   * legend for a layer
   */
  const handleExpandItem = (value) => {
    setExpandedItems((prevState) => {
      const newValues = [...prevState];
      const existingIndex = newValues.indexOf(value);
      if (existingIndex > -1) {
        newValues.splice(existingIndex, 1);
      } else {
        newValues.push(value);
      }
      return newValues;
    });
  };

  return (
    <Box display="flex" flexDirection="column">
      <List dense>
        {uniqueItems?.length === 0 && (
          <Box textAlign="center">
            <Typography variant="body1">No layers found</Typography>
          </Box>
        )}
        {uniqueItems
          ?.sort((a, b) =>
            (a.legendOrder || 0) > (b.legendOrder || 0) ? -1 : 1
          )
          .map((item) => {
            const open = expandedItems.includes(item?.name);
            const layerVisible = item?.layout?.visibility === "visible";
            return (
              <Box key={item?.name} id="layerCheck">
                <ListItem
                  // style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleVisibilityChange(item);
                    (!layerVisible && !open && handleExpandItem(item?.name)) ||
                      (layerVisible && open && handleExpandItem(item?.name));
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={layerVisible}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ "aria-labelledby": "test" }}
                  />
                  <ListItemText
                    primary={item?.name}
                    primaryTypographyProps={{
                      color: layerVisible ? "textPrimary" : "textSecondary",
                    }}
                  />
                  <ListItemSecondaryAction
                    onClick={() => handleExpandItem(item?.name)}
                  >
                    <IconButton edge="end" aria-label="delete">
                      <LayerLegendIcon open={open} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <LayerLegend
                  open={open}
                  item={item}
                  onOpacityChange={onOpacityChange}
                  onBooleanChange={onBooleanChange}
                  value={value}
                  setValue={setValue}
                  handleVisibilityChange={handleVisibilityChange}
                  items={items}
                />
              </Box>
            );
          })}
      </List>
    </Box>
  );
};

export default LayersControl;
