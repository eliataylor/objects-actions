import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { AiSchemaResponse, SchemaVersions } from "./generator-types";
import WorksheetDetail from "./WorksheetDetail";
import { LinearProgress } from "@mui/material";

export function extractJson(text: string): [AiSchemaResponse, string] | null {
  // Find JSON starting points: ```json, {, or [
  let jsonStr = "", jsonObj = null;
  if (text.indexOf("```json") > -1) {
    const start = text.indexOf("```json");
    jsonStr = text.substring(start + 7);
    const end = jsonStr.indexOf("```"); // get NEXT ```, not just last or first
    if (end > -1) {
      jsonStr = jsonStr.substring(0, end).trim();
      try {
        let jsonObj = JSON.parse(jsonStr);
        if ("schema" in jsonObj) { // WARN: hackery. fix for response_format when schema is nested
          jsonObj = jsonObj.schema;
        }
        return [jsonObj, text.substring(start, start + end + 3)];
      } catch (e) {
        console.info("Error decoding JSON:", e, jsonStr);
      }
    }
  }

  const start = text.indexOf("{") < text.indexOf("[") ? text.indexOf("{") : text.indexOf("[");

  if (start > -1) {
    const end = text.lastIndexOf(text[start] === '[' ? ']' : '}');
    if (end > -1) {
      jsonStr = text.substring(start, end).trim();
      try {
        jsonObj = JSON.parse(jsonStr);
        if ("schema" in jsonObj) { // WARN: hackery. fix in response_format
          jsonObj = jsonObj.schema;
        }
        return [jsonObj, text.substring(start, end)];
      } catch (e) {
        console.info("Error decoding JSON:", e, jsonStr);
      }
    }
  }
  console.info("No JSON object found in the string.");
  return null;

}

const WorksheetLoader = () => {
  const { id, version } = useParams();
  const [worksheet, setWorksheet] = useState<SchemaVersions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorksheet = async (versionId: number) => {
    try {
      const response: HttpResponse<SchemaVersions> = await ApiClient.get(`/api/worksheets/${versionId}`);
      if (response.success && response.data) {
        const newWorksheet = response.data as SchemaVersions;
        if (!newWorksheet.schema && newWorksheet.reasoning) {
          const json = extractJson(newWorksheet.reasoning);
          if (Array.isArray(json)) {
            newWorksheet.schema = json[0];
            newWorksheet.reasoning = newWorksheet.reasoning.replace(json[1], "");
          } else {
            console.warn("No schema found for worksheet.", newWorksheet);
          }
        }
        setWorksheet(newWorksheet);
      } else {
        setError("Failed to load worksheet.");
      }
    } catch (err) {
      setError("An error occurred while fetching worksheet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorksheet(version ? parseInt(version) : parseInt(id ?? "0"));
  }, [id, version]);

  if (loading) return <div>
    Loading...
    <LinearProgress />
  </div>;
  if (error) return <div>{error}</div>;
  if (!worksheet) return <div>Worksheet not found.</div>;

  return <WorksheetDetail worksheet={worksheet} refetchWorksheet={fetchWorksheet} />;
};

export default WorksheetLoader;
