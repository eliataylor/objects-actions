import React, { useEffect, useState } from "react";
import { LinearProgress } from "@mui/material";
import Paper from "@mui/material/Paper";
import ReactMarkdown from "react-markdown";

export type StreamChunk = {
  type: "message" | "tool_result" | "corrected_schema" | "done";
  content: string | Record<string, any>;
  event: string;
  config_id?: string;
  schema_version?: string;
  error?: string;
};

interface StreamingOutputProps {
  chunk: StreamChunk | null;
  onSchema: (chunk:StreamChunk) => void;
  onVersionComplete: (chunk:StreamChunk) => void;
}

const StreamingOutput: React.FC<StreamingOutputProps> = ({ chunk, onSchema, onVersionComplete }) => {
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chunk) return;

    if (chunk.error) {
      setError(chunk.error);
    } else if (chunk.type === "message" && chunk.content) {
      setReasoning(reasoning.concat(chunk.content as string));
    } else if (chunk.type === "corrected_schema" || chunk.type === "tool_result") {
      onSchema(chunk)
    } else if (chunk.schema_version) {
      onVersionComplete(chunk)
    }
  }, [chunk]); // Reacts to each new chunk update

  return (
    <React.Fragment>
      {error && <p className="error">{error}</p>}

      <Paper elevation={1} sx={{ p: 1 }}>
        {reasoning.length > 0 ? (
            <ReactMarkdown>
              {reasoning.join("")}
            </ReactMarkdown>
          ) :
          <LinearProgress />}
      </Paper>

    </React.Fragment>
  );
};

export default StreamingOutput;
