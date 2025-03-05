import React from "react";
import { Container, Grid, Card, CardContent, Typography, Button, Box } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";

const pricingOptions = [
  {
    title: "Full Stack from Content Types",
    price: "$499",
    description: "Generate a full-stack application from structured content types, including backend and frontend.",
    features: ["Auto-generated API", "Database schema setup", "React-based frontend"],
  },
  {
    title: "Permissions and Access Controls",
    price: "$249",
    description: "Add role-based access control and user permissions management to your application.",
    features: ["RBAC implementation", "Fine-grained access control", "Admin dashboard"],
  },
  {
    title: "Cloud Deploy to GCP",
    price: "$249",
    description: "Seamless deployment of your full-stack application to Google Cloud Platform.",
    features: ["Containerized deployment", "CI/CD setup", "Scalable hosting"],
  },
];

const Consulting: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Consulting Pricing
      </Typography>
      <Typography variant="h6" align="center" color="textSecondary" paragraph>
        Choose the right plan for your needs and build your application effortlessly.
      </Typography>
      <Grid container spacing={4}>
        {pricingOptions.map((option, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {option.title}
                </Typography>
                <Typography variant="h4" color="primary" sx={{textAlign:'center'}} gutterBottom>
                  {option.price}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {option.description}
                </Typography>
                <Box mt={2}>
                  {option.features.map((feature, i) => (
                    <Typography key={i} variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleOutline color="primary" fontSize="small" /> {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Consulting;
