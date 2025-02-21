import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { WorksheetModel } from "./WorksheetType";
import WorksheetDetail from "./WorksheetDetail";
import { LinearProgress } from "@mui/material";

const WorksheetLoader = () => {
  const { id, version } = useParams();
  const [worksheet, setWorksheet] = useState<WorksheetModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorksheet = async () => {
      try {
        const response: HttpResponse<WorksheetModel> = await ApiClient.get(`/api/worksheets/${version ?? id}`);
        if (response.success && response.data) {
          setWorksheet(response.data as WorksheetModel);
        } else {
          setError("Failed to load worksheet.");
        }
      } catch (err) {
        setError("An error occurred while fetching worksheet.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorksheet();
  }, [id, version]);

  if (loading) return <div>
    Loading...
    <LinearProgress />
  </div>;
  if (error) return <div>{error}</div>;
  if (!worksheet) return <div>Worksheet not found.</div>;

  return <WorksheetDetail worksheet={worksheet} />;
};

export default WorksheetLoader;
