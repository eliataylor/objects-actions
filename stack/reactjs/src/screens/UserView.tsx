import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { ModelType, NAVITEMS } from "../object-actions/types/types";
import EntityCard from "../object-actions/components/EntityCard";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ApiClient from "../config/ApiClient";
import EntityList from "./EntityList";
import Snackbar from "@mui/material/Snackbar";
import { canDo } from "../object-actions/types/access";
import { useAuth } from "../allauth/auth";
import PermissionError from "../components/PermissionError";

const UserView: React.FC = () => {
  const location = useLocation();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const { uid } = useParams();
  const me = useAuth()?.data?.user;
  const [userProfile, updateUserProfile] = React.useState<ModelType<"Users"> | null>(
    null
  );
  const [stats, updateStats] = React.useState<{ [key: string]: number }>({});
  const [snack, showSnackBar] = React.useState("");
  const closeSnackbar = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    showSnackBar("");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await ApiClient.get(
        `/api/users/${uid}${location.search}`
      );
      if (response.error) {
        return showSnackBar(response.error);
      }
      if (response.success && response.data) {
        updateUserProfile(response.data as ModelType<"Users">);
      }
    };
    fetchUserProfile();
  }, [location.pathname, location.search, uid]);

  useEffect(() => {
    const newstats = { ...stats };
    const fetchStats = async (model: string) => {
      const response = await ApiClient.get(
        `/api/users/${uid}/${model.toLowerCase()}/stats${location.search}`
      );
      if (response.error) {
        return showSnackBar(response.error);
      }
      if (response.success && response.data) {
        // @ts-ignore
        newstats[model] = response.data.count;
      }
    };

    const updateAllStats = async () => {
      const fetchPromises = NAVITEMS.map(async (item) => {
        if (item.type === "Users") return null;
        await fetchStats(item.type);
      });

      await Promise.all(fetchPromises);

      updateStats(newstats);
    };

    updateAllStats();

    console.log("STATS", stats);
  }, [stats, location.search, uid]);

  if (!userProfile) return null;

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  if (!userProfile) return <Typography>Loading...</Typography>;

  const canView = canDo("view", userProfile, me);

  if (typeof canView === "string") {
    return <PermissionError error={canView} />;
  }

  return (
    <Box>
      <Snackbar
        open={snack.length > 0}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        message={snack}
      />
      <EntityCard entity={userProfile} />

      {NAVITEMS.map((item) => {
        if (item.type === "Users") return null;
        return (
          <Accordion
            expanded={expanded === item.type}
            key={`byusers-${item.type}`}
            onChange={handleChange(item.type)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`byusers-${item.type}-content`}
              id={`byusers-${item.type}-header`}
              sx={{
                justifyContent: "space-between",
                alignContent: "center",
                alignItems: "center",
                display: "flex"
              }}
            >
              {typeof stats[item.type] !== "undefined" && (
                <Typography variant={"subtitle2"} mr={2}>
                  {stats[item.type]}
                </Typography>
              )}

              <Typography variant={"subtitle2"}>{item.plural}</Typography>
            </AccordionSummary>
            <AccordionDetails id={`byusers-${item.type}-content`}>
              <Typography>
                {expanded === item.type && (
                  <EntityList author={uid} model={item.type} />
                )}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default UserView;
