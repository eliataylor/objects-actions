import React from 'react';
import { Box, CircularProgress, Grid, List, SvgIcon } from "@mui/material";
import { ReactComponent as LOGO } from '../logo.svg';
import ContentMenu from "../components/ContentMenu";

interface ContentTypesHomeProps {
  loading?: string;
}

const ContentTypesHome: React.FC<ContentTypesHomeProps> = ({ loading = undefined }) => {
  const toPass = {
    sx: {
      height: 'auto!important',
      filter: `drop-shadow(0 2px 2px rgba(114, 134, 71, 0.6))`,
      fontSize: 100,
    },
  };

  return <List dense={true}> <ContentMenu /></List>;
};

export default ContentTypesHome;
