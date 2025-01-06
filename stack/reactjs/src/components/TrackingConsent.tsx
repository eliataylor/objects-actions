import React, { useState } from 'react';
import TrackingPermissions, { PermissionKeys } from './TrackingPermissions';
import { AppBar, Box, Fab, Toolbar } from "@mui/material";
import { Check } from '@mui/icons-material';

import { styled } from '@mui/material/styles';

const permissions: PermissionKeys = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'granted',
};

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -35,
  left: 0,
  right: 0,
  margin: '0 auto',
});

const TrackingConsent: React.FC = () => {
  const [accepted, setAccepted] = useState(
    localStorage.getItem('gtag-oaexample') ? true : false,
  );

  if (accepted === true) return null;

  function handleAccepted() {
    localStorage.setItem('gtag-oaexample', 'true');
    setAccepted(true);
  }

  return (
    <Box position="fixed" sx={{borderRadius:'0 0 0 10px', zIndex:9, bottom: 8, left:8, padding:2, backgroundColor: 'background.paper' }}>
      <Toolbar>
        <StyledFab
          aria-label={'Dismiss EULA Notice'}
          color="secondary"
          size={'small'}
          onClick={() => handleAccepted()}
        >
          <Check />
        </StyledFab>
        <TrackingPermissions permissions={permissions} />
      </Toolbar>
    </Box>
  );
};

export default TrackingConsent;
