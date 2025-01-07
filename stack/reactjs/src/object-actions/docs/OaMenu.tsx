import React from 'react';
import { useLocation } from 'react-router-dom';
import { useObjectActions } from '../ObjectActionsProvider';
import { LocalLibrary } from '@mui/icons-material';
import InstallIcon from '@mui/icons-material/Download';
import CustomizeIcon from '@mui/icons-material/Build';
import ExtendIcon from '@mui/icons-material/Extension';
import ContributeIcon from '@mui/icons-material/VolunteerActivism';
// import SponsorIcon from "@mui/icons-material/MonetizationOn";
// import SourceIcon from "@mui/icons-material/Code";
import FirstVisit from '../components/FirstVisit';
import { NavBarItem } from '../../components/AuthMenu';
import LightDarkImg from '../../components/LightDarkImg';

const OaMenu: React.FC<{ handleClick: () => void }> = ({ handleClick }) => {
  const location = useLocation();
  const { accessDefault, setAccessDefault } = useObjectActions();

  return (
    <React.Fragment>
      <FirstVisit />

      <NavBarItem
        to={'/oa/readme'}
        icon={<LocalLibrary fontSize={'small'} />}
        name={'About O/A'}
      />
      <NavBarItem
        to={'/oa/install'}
        icon={<InstallIcon fontSize={'small'} />}
        name={'Install'}
      />
      <NavBarItem
        to={'/oa/customize'}
        icon={<CustomizeIcon fontSize={'small'} />}
        name={'Customize'}
      />
      <NavBarItem
        to={'/oa/extend'}
        icon={<ExtendIcon fontSize={'small'} />}
        name={'Extend'}
      />
      <NavBarItem
        to={'/oa/contribute'}
        icon={<ContributeIcon fontSize={'small'} />}
        name={'Contribute'}
      />
      {/* <NavBarItem to={'https://github.com/sponsors/eliataylor'} icon={<SponsorIcon fontSize={'small'}/>} name={'Sponsor'}/> */}
      <NavBarItem
        to={'https://github.com/eliataylor/objects-actions'}
        icon={
          <LightDarkImg
            light={'/oa-assets/github-mark.svg'}
            dark={'/oa-assets/github-mark-white.svg'}
            styles={{ height: 18 }}
          />
        }
        name={'Open Source'}
      />

      {/*
            <FormControl sx={{marginTop: 3, marginBottom: 3}} variant={'filled'} fullWidth={true} size={"small"}>
                <InputLabel id="defaultperms-label">Default Permission</InputLabel>
                <Select
                    labelId="defaultperms-label"
                    id="defaultperms"
                    color={'secondary'}
                    fullWidth={true}
                    value={accessDefault}
                    onChange={(e) => setAccessDefault(e.target.value)} >
                    <MenuItem value={'AllowAny'}>
                        Allow Any
                    </MenuItem>
                    <MenuItem value={'IsAuthenticated'}>
                        Allow all for Authenticated
                    </MenuItem>
                    <MenuItem value={'IsAuthenticatedOrReadOnly'}>
                        Is Authenticated or Read only
                    </MenuItem>
                </Select>
                <FormHelperText>Default permission for Actions NOT matched in your matrix spreadsheet</FormHelperText>
            </FormControl>
            */}
    </React.Fragment>
  );
};

export default OaMenu;
