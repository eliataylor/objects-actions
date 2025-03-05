import React from "react";
import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { TightButton } from "../../theme/StyledFields";
import LightDarkImg from "../../components/LightDarkImg";

const pricingOptions = [
  {
    title: "Your Full Stack Architecture",
    price: "$499",
    description: "8 hours, 1-one-1, screensharing session to design your scalable database and full-stack architecture.",
    features: [
      "Your idea's content types and fields formally documented.",
      "ReactJS Web App.",
      "Django API & CMS.",
      "Cypress Test Suite.",
      "Fake Data Generator.",
      "User Authentication with Email / Username + Password, SMS + Code, MFA, Google, Facebook, LinkedIn, Spotify, & Github."
    ]
  },
  {
    title: "Your Roles & Permissions",
    price: "$249",
    description: "Another 4 hours to discuss and implement role-based access permissions for all operations.",
    features: [
      "Secure access to Create, Read, Update, or Delete (CRUD).",
      "Fine tune CRUD access based on content ownership.",
      "Clear error handling."
    ]
  },
  {
    title: "Your Domain Deployed",
    price: "$249",
    description: "Deploy your full stack to your custom domain on your Google Cloud Platform.",
    features: [
      "Your custom domain configured.",
      "HTTPS via Load balancers with multi-region distribution.",
      "Deployment pipeline to release future improvements with 1 command."
    ]
  },
  {
    title: "Your Mobile App",
    price: "$249",
    description: "Publish your responsive web app with Flutter with handling for Deep Links and Push Notifications.",
    features: [
      "iOS Build.",
      "Android Build."
    ]
  }
];

const Consulting: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleCopy = async () => {
    const textToCopy = "Help@OAExample.com";
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        enqueueSnackbar("Email copied to clipboard", { variant: "success" });
      } catch (error) {
        console.error("Failed to copy text: ", error);
        enqueueSnackbar("Failed to copy text", { variant: "error" });
      }
    } else {
      console.error(
        "Clipboard API is not available. Please copy manually: " + textToCopy
      );
    }
  };

  return (
    <Box p={1}>
      <Typography variant="h6" align="center" sx={{ fontWeight: 100 }}>
        Need Help?
      </Typography>
      {/* <Typography variant="h6" align="center" color="textSecondary" gutterBottom={true}>
        For founders and small startups ready to launch a secure, scalable application.
      </Typography> */}
      <Typography variant="h3" align="center" color="textSecondary" gutterBottom={true} style={{ textAlign: "center", margin: "20px auto" }}>
        Get a solid, secure full-stack foundation built for growth, without the guesswork.
      </Typography>
      <Grid container spacing={2}>
        {pricingOptions.map((option, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent>
                <Typography variant="h5" align="center" gutterBottom>
                  {option.title}
                </Typography>
                <Typography variant="h4" color="primary" align="center" sx={{ fontWeight: 100 }} gutterBottom>
                  {option.price}
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  {option.description}
                </Typography>
                <Box mt={2}>
                  <Typography variant="overline" sx={{ fontSize: 9 }}>INCLUDES</Typography>
                  {option.features.map((feature, i) => (
                    <Typography key={i} variant="body2" sx={{ display: "flex", alignItems: "flex-start", gap: .7, mb: .5 }}>
                      <CheckCircleOutline color="primary" fontSize="small" /> {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography align={"center"} style={{  margin: "20px auto" }}>
        <a
          href={"https://calendar.app.google/N9RfLgwx62TqJRqs5"}
          target={"_blank"}
          style={{ textAlign: "center" }}
        >
          <TightButton
            size={"small"}
            variant={"contained"}
            startIcon={
              <LightDarkImg
                light={"/oa-assets/google-calendar.svg"}
                dark={"/oa-assets/google-calendar.svg"}
                styles={{ height: 20 }}
              />
            }
          >
            Book a Free 30 minute consult today!
          </TightButton>
        </a>
      </Typography>


      <Typography align={"center"} style={{ margin: "10px auto 30px auto" }}>

        or email
        <Button variant={"text"} size={"large"}
                onClick={handleCopy}>Help <span style={{ margin: "0 2px" }}>@</span> OAExample.com</Button>

      </Typography>

    </Box>
  );
};

export default Consulting;
