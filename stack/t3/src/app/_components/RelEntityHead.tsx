import React from "react";
import { NAVITEMS, type RelEntity } from "../../types/types";
import CardHeader, { type CardHeaderProps } from "@mui/material/CardHeader";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import { Typography } from "@mui/material";

interface RelEntityHeadProps {
  rel: RelEntity;
  label?: string;
}

const RelEntityHead: React.FC<RelEntityHeadProps> = ({ rel, label }) => {
  const headerProps: Partial<CardHeaderProps> = {};
  if (rel.img) {
    headerProps.avatar = (
      <Avatar variant={"rounded"} src={rel.img} alt={rel.str} />
    );
  }

  const hasUrl = NAVITEMS.find((nav) => nav.type === rel["_type"]);

  headerProps.title = (
    <Typography variant={"body1"}>
      {label ? label : !hasUrl ? rel["_type"] : hasUrl.singular}{" "}
    </Typography>
  );
  headerProps.subheader = (
    <Typography variant={"body2"}>
      {!hasUrl ? (
        rel.str
      ) : (
        <Link href={`/${hasUrl.segment}/${rel.id}`}>{rel.str}</Link>
      )}
    </Typography>
  );

  return <CardHeader sx={{ p: 0 }} {...headerProps} />;
};

export default RelEntityHead;
