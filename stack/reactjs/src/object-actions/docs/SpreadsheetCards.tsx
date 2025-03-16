import React, { useState } from "react";
import { Card, CardHeader, CardMedia, Dialog, DialogContent, Grid, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TightButton } from "../../theme/StyledFields";

const SpreadsheetCards: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (src: string) => {
    setSelectedImage(src);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardHeader
              sx={{ mb: 0, p: 1 }}
              title={"Define your Fields"}
              subheader={"for each Object type"}
            />
            <CardMedia
              height={320}
              component={"img"}
              alt={"Object Field Types"}
              src={
                "https://raw.githubusercontent.com/eliataylor/objects-actions/refs/heads/main/docs/images/object-fields-demo.png"
              }
              onClick={() =>
                handleImageClick(
                  "https://raw.githubusercontent.com/eliataylor/objects-actions/refs/heads/main/docs/images/object-fields-demo.png"
                )
              }
              sx={{ cursor: "pointer" }}
            />
            <Grid sx={{ p: 1 }} container justifyContent={"space-between"}>
              <a
                href={
                  "https://docs.google.com/spreadsheets/d/14Ej7lu4g3i85BWJdHbi4JK2jM2xS5uDSgfzm3rIhx4o/edit?gid=845262387#gid=845262387"
                }
                target="_blank" rel="noreferrer"
              >
                <TightButton
                  size={"small"}
                  startIcon={
                    <img
                      alt={'google sheets logo'}
                      src={"/oa-assets/Google_Sheets_2020_Logo.svg"}
                      height={20}
                    />
                  }
                >
                  New Worksheet
                </TightButton>
              </a>

              <a
                href="https://docs.google.com/spreadsheets/d/1Jm15OeR6mS6vbJd7atHErOwBgq2SwKAagb4MH0D1aIw/edit?gid=1461137270#gid=1461137270"
                target="_blank" rel="noreferrer"
              >
                <TightButton
                  size={"small"}
                  startIcon={
                    <img
                      alt={'google sheets logo'}
                      src={"/oa-assets/Google_Sheets_2020_Logo.svg"}
                      height={20}
                    />
                  }
                >
                  Completed Example
                </TightButton>
              </a>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardHeader
              sx={{ mb: 0, p: 1 }}
              title={"Define your roles and permissions"}
              subheader={"for each Action on any Object"}
            />
            <CardMedia
              height={320}
              component={"img"}
              alt={"Permission Matrix"}
              src={
                "https://raw.githubusercontent.com/eliataylor/objects-actions/refs/heads/main/docs/images/permissions-matrix-demo.png"
              }
              onClick={() =>
                handleImageClick(
                  "https://raw.githubusercontent.com/eliataylor/objects-actions/refs/heads/main/docs/images/permissions-matrix-demo.png"
                )
              }
              sx={{ cursor: "pointer" }}
            />
            <Grid sx={{ p: 1 }} container justifyContent={"space-between"}>
              <a
                href={
                  "https://docs.google.com/spreadsheets/d/14Ej7lu4g3i85BWJdHbi4JK2jM2xS5uDSgfzm3rIhx4o/edit?gid=1619189607#gid=1619189607"
                }
                target="_blank" rel="noreferrer"
              >
                <TightButton
                  size={"small"}
                  startIcon={
                    <img
                      alt={'google sheets logo'}
                      src={"/oa-assets/Google_Sheets_2020_Logo.svg"}
                      height={20}
                    />
                  }
                >
                  New Worksheet
                </TightButton>
              </a>

              <a
                href="https://docs.google.com/spreadsheets/d/1Jm15OeR6mS6vbJd7atHErOwBgq2SwKAagb4MH0D1aIw/edit?gid=12324120#gid=12324120"
                target="_blank" rel="noreferrer"
              >
                <TightButton
                  size={"small"}
                  startIcon={
                    <img
                      alt={'google sheets logo'}
                      src={"/oa-assets/Google_Sheets_2020_Logo.svg"}
                      height={20}
                    />
                  }
                >
                  Completed Example
                </TightButton>
              </a>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogContent sx={{ position: "relative", p: 0 }}>
          <IconButton
            size={"small"}
            onClick={handleClose}
            color="primary"
            sx={{
              position: "absolute",
              top: 6,
              right: 9,
              backgroundColor: "secondary.light",
              border: "2px solid #ccc"
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={selectedImage || ""}
            alt="Fullscreen"
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SpreadsheetCards;
