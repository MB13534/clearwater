import {
  Box,
  FormControl as MuiFormControl,
  Select,
  MenuItem,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import styled from "styled-components/macro";

const FormControl = styled(MuiFormControl)`
  margin-left: ${({ theme }) => theme.spacing(2)}px;
`;

const BufferInputRow = ({ bufferName, onChange, values }) => {
  return (
    <Box my={4}>
      <TextField
        id={`${bufferName}-bufferAmount`}
        name="bufferAmount"
        size="small"
        onChange={(event) => onChange(event, bufferName)}
        value={values.bufferAmount}
        variant="outlined"
      />

      <FormControl size="small" variant="outlined">
        <Select
          labelId={`${bufferName}-units-label`}
          id={`${bufferName}-units`}
          name="units"
          value={values.units}
          onChange={(event) => onChange(event, bufferName)}
        >
          <MenuItem value="miles">Miles</MenuItem>
          <MenuItem value="feet">Feet</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

const SearchRadiusControl = ({
  controlEnabled,
  handleControlEnabled,
  bufferValues,
  onBufferValuesChange,
  onClearBuffers,
  onResetBuffers,
}) => {
  const handleClearBuffers = (event) => {
    event.preventDefault();
    onClearBuffers();
  };

  return (
    <Box p={1} mb={2}>
      <Typography variant="body1">
        This control can be used to create radius rings to easily identify if
        features fall within a specified area. To use the tool, click anywhere
        on the map.
      </Typography>
      <Box my={2} width="100%">
        <Typography variant="subtitle1">Buffers</Typography>
        <form onSubmit={handleClearBuffers}>
          <Box>
            <BufferInputRow
              bufferName="buffer1"
              onChange={onBufferValuesChange}
              values={bufferValues.buffer1}
            />
            <BufferInputRow
              bufferName="buffer2"
              onChange={onBufferValuesChange}
              values={bufferValues.buffer2}
            />
            <BufferInputRow
              bufferName="buffer3"
              onChange={onBufferValuesChange}
              values={bufferValues.buffer3}
            />
            <BufferInputRow
              bufferName="buffer4"
              onChange={onBufferValuesChange}
              values={bufferValues.buffer4}
            />
          </Box>
          <Box display="flex" gridColumnGap={8}>
            <Button type="submit" variant="contained">
              Clear Buffers
            </Button>
            <Button onClick={onResetBuffers} type="reset" variant="contained">
              Reset Form
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default SearchRadiusControl;
