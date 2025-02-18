import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface EnvConfig {
  PROJECT_NAME: string;
  STACK_PATH: string;
  TYPES_PATH: string;
  PERMISSIONS_PATH: string;
  REACT_APP_API_HOST: string;
  REACT_APP_APP_HOST: string;
  REACT_APP_LOGIN_EMAIL: string;
  REACT_APP_LOGIN_PASS: string;
  DEFAULT_PERMS: string;
  OA_ENV_DB: string;
  OA_ENV_EMAIL: string;
  OA_ENV_STORAGE: string;
}

const defaultEnvConfig: EnvConfig = {
  PROJECT_NAME: process.env.REACT_APP_TITLE || 'OAexample',
  STACK_PATH: '.',
  TYPES_PATH: 'src/examples/object-fields-demo.csv',
  PERMISSIONS_PATH: 'src/examples/permissions-matrix-demo.csv',
  REACT_APP_API_HOST: process.env.REACT_APP_API_HOST || 'https://localapi.oaexample.com:8080',
  REACT_APP_APP_HOST: process.env.REACT_APP_APP_HOST || 'https://localhost.oaexample.com:3000',
  REACT_APP_LOGIN_EMAIL: process.env.REACT_APP_LOGIN_EMAIL || 'info@oaexample.com',
  REACT_APP_LOGIN_PASS: process.env.REACT_APP_LOGIN_PASS || 'APasswordYouShouldChange',
  DEFAULT_PERMS: process.env.REACT_APP_DEFAULT_PERMS || 'IsAuthenticatedOrReadOnly',
  OA_ENV_DB: 'docker',
  OA_ENV_EMAIL: 'console',
  OA_ENV_STORAGE: 'local',
};

console.log("DEFAULT ENV ", defaultEnvConfig)

const EnvContext = createContext<{
  envConfig: EnvConfig;
  setEnvConfig: (config: EnvConfig) => void;
  setConfigItem: <K extends keyof EnvConfig>(
    key: K,
    value: EnvConfig[K],
  ) => void;
}>({
  envConfig: defaultEnvConfig,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setEnvConfig: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setConfigItem: () => {},
});

export const EnvProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [envConfig, setEnvConfig] = useState<EnvConfig>(defaultEnvConfig);

  const setConfigItem = <K extends keyof EnvConfig>(
    key: K,
    value: EnvConfig[K],
  ) => {
    setEnvConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <EnvContext.Provider value={{ envConfig, setEnvConfig, setConfigItem }}>
      {children}
    </EnvContext.Provider>
  );
};

export const useEnvContext = () => useContext(EnvContext);
