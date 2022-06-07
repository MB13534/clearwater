import React, { useState } from "react";
import AWS from "aws-sdk";
import { useApp } from "../../../AppProvider";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { File, Folder, Upload as UploadIcon } from "react-feather";
import {
  Box,
  Chip,
  Typography,
  Button as MuiButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from "@material-ui/core";
import styled from "styled-components/macro";
import { spacing } from "@material-ui/system";
import { useQuery } from "react-query";
import FolderIcon from "@material-ui/icons/Folder";
import IconButton from "@material-ui/core/IconButton";
import { ArrowDropDown, ArrowRight } from "@material-ui/icons";
import { rgba } from "polished";
import Loader from "../../../components/Loader";

const Button = styled(MuiButton)(spacing);

const FieldItem = styled.div`
  border-left: 3px solid ${(props) => props.theme.palette.background.toolbar};
  padding-left: 12px;
  &.error {
    border-color: red;
  }
`;

const FieldToggleIcon = styled(IconButton)`
  position: absolute;
  left: -22px;
  width: 18px;
  height: 18px;
  border-radius: 2px;

  &,
  &:active,
  &:focus,
  &:focus-within {
    background-color: ${(props) => props.theme.palette.background.toolbar};
  }

  svg {
    position: absolute;
    width: 22px;
    height: 22px;
  }

  @media (hover: none) {
    &:hover {
      background-color: ${(props) => props.theme.palette.background.toolbar};
    }
  }
`;

const FieldIconLess = styled(ArrowRight)`
  color: ${(props) => rgba(props.theme.sidebar.color, 0.5)};
`;

const FieldIconMore = styled(ArrowDropDown)`
  color: ${(props) => rgba(props.theme.sidebar.color, 0.5)};
`;

const Label = styled(Typography)`
  font-weight: ${(props) => props.theme.typography.fontWeightBold};
  margin-bottom: ${(props) => props.theme.spacing(3)}px;
`;

const Upload = ({ config }) => {
  const { cuwcd_well_number: wellName, well_ndx: wellNdx } = config.data;

  const { getAccessTokenSilently } = useAuth0();
  const { doToast } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  //query for files attached to this current well
  const {
    data: attachmentsData,
    error,
    isFetching,
    refetch,
  } = useQuery(
    ["wells-to-attachments"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };
        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/wells-to-attachments/${wellNdx}`,
          { headers }
        );
        return data.filter((item) => item.removed !== true);
      } catch (err) {
        console.error(err);
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const handleFileInput = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDelete = () => {
    setSelectedFile(null);
  };

  async function writeUrlToTable(fileName, fileLocation) {
    try {
      const token = await getAccessTokenSilently();
      const headers = { Authorization: `Bearer ${token}` };

      //links url of attachment in S3 to wells_to_attachments table
      await axios.post(
        `${process.env.REACT_APP_ENDPOINT}/api/wells-to-attachments`,

        {
          well_ndx: wellNdx,
          attachment_desc: `${wellName} ${fileName}`,
          attachment_filepath: fileLocation,
          attachment_notes: "Added through UI",
        },

        { headers }
      );

      //refetches attachmentsData to include newly added attachment
      await refetch();
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log(`call was cancelled`);
      } else {
        console.error(err);
      }
    }
  }

  //uploads selected file to s3 bucket
  const AWSconfig = {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_REGION,
  };
  const S3 = new AWS.S3(AWSconfig);
  const [isUploading, setIsUploading] = useState(false);
  const uploadFile = async (file) => {
    if (!file) {
      doToast("warning", "No file selected");
      return null;
    }
    setIsUploading(true);
    S3.upload(
      {
        Body: file,
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
        Key: `attached_files/${wellNdx}/${file.name}`,
        ContentType: file.type,
      },
      (err, data) => {
        if (err) {
          const message = err?.message ?? "Something went wrong";
          doToast("error", message);
        } else {
          doToast("success", "New file was uploaded to the database");
          const fileLocation = data.Location;

          writeUrlToTable(file.name, fileLocation);
        }
        setIsUploading(false);
        setSelectedFile(null);
      }
    );
  };

  return (
    <>
      <Grid
        item
        xs={12}
        md={12}
        style={{
          position: "relative",
        }}
      >
        {isFetching ? (
          <Loader />
        ) : (
          <FieldItem className={error ? "error" : ""}>
            <Grid container justify={"space-between"}>
              <Grid item>
                <FieldToggleIcon
                  size={"small"}
                  onClick={() => {
                    setIsOpen(!isOpen);
                  }}
                >
                  {isOpen ? <FieldIconMore /> : <FieldIconLess />}
                </FieldToggleIcon>
                <Label
                  color={error ? "error" : "textPrimary"}
                  style={{ display: "inline-block" }}
                >
                  Attachments
                </Label>
              </Grid>
            </Grid>

            {isOpen &&
              (attachmentsData?.length ? (
                <List style={{ padding: 0 }}>
                  {attachmentsData.map((item) => {
                    return (
                      <ListItem
                        button
                        component="a"
                        href={item.attachment_filepath}
                        target="_blank"
                        key={item.att_ndx}
                      >
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText primary={item.attachment_desc} />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                "No files are currently attached to this well"
              ))}
          </FieldItem>
        )}

        <div style={{ paddingTop: "20px" }}>
          <Button
            component="label"
            startIcon={<File />}
            variant="outlined"
            color="primary"
            type="button"
          >
            Select File
            <input
              type="file"
              hidden
              onChange={handleFileInput}
              onClick={(event) => {
                event.target.value = null;
              }}
            />
          </Button>
          <Button
            mr={4}
            ml={4}
            component="label"
            startIcon={<UploadIcon />}
            variant="contained"
            color="primary"
            type="button"
            onClick={() => uploadFile(selectedFile)}
          >
            Upload File
          </Button>
          <Box component="span" marginTop={2} marginBottom={2}>
            {isUploading ? (
              <Loader />
            ) : selectedFile ? (
              <Chip
                pr={5}
                label={selectedFile.name}
                clickable={false}
                color="primary"
                icon={<Folder />}
                onDelete={handleDelete}
                variant="outlined"
                size="small"
              />
            ) : (
              <Typography component="span" variant="subtitle2">
                Select a file to attach it to the well
              </Typography>
            )}
          </Box>
        </div>
      </Grid>
    </>
  );
};

export default Upload;
