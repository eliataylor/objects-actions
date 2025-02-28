import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";

export type StreamChunk = {
  type: "message" | "partial_function_call" | "done";
  content?: string;
  arguments?: Record<string, any>;
  schema?: Record<string, any>;
  error?: string;
};

interface StreamingOutputProps {
  chunk: StreamChunk | null;
}

const StreamingOutput: React.FC<StreamingOutputProps> = ({ chunk }) => {
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [schema, setSchema] = useState<Record<string, any>>({});
  const [finalSchema, setFinalSchema] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chunk) return;

    if (chunk.error) {
      setError(chunk.error);
    } else if (chunk.type === "message" && chunk.content) {
      setReasoning(reasoning.concat(chunk.content));
    } else if (chunk.type === "partial_function_call" && chunk.arguments) {
      setSchema((prev) => ({ ...prev, ...chunk.arguments })); // Merge incremental updates
    } else if (chunk.type === "done" && chunk.schema) {
      setFinalSchema(chunk.schema);
    }
  }, [chunk]); // Reacts to each new chunk update

  return (
    <React.Fragment>
      {error && <p className="error">{error}</p>}

      <Paper elevation={1}>
        <Typography variant={"h5"}>Schema Reasoning:</Typography>
        {reasoning.length > 0 ? (
          <Box>
            {reasoning.map((message, index) => (
              <React.Fragment key={index}>{message}</React.Fragment>
            ))}
          </Box>
        ) : (
          <p>Waiting for reasoning...</p>
        )}
      </Paper>

      <Paper>
        <Typography variant={"h5"}>Generated Schema (Streaming):</Typography>
        {Object.keys(schema).length > 0 ? (
          <code>{JSON.stringify(schema, null, 2)}</code>
        ) : (
          <p>Generating schema...</p>
        )}
      </Paper>

      <Paper>
        <Typography variant={"h5"}>Final Schema:</Typography>
        {finalSchema ? (
          <code>
            <pre>{JSON.stringify(finalSchema, null, 2)}</pre>
          </code>
        ) : (
          <p>Waiting for final schema...</p>
        )}
      </Paper>

    </React.Fragment>
  );
};

export default StreamingOutput;
