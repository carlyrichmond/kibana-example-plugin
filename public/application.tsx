import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { KibanaExamplePluginApp } from './components/app';

export const renderApp = (
  { notifications, http }: CoreStart,
  { data, navigation, unifiedSearch }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <KibanaExamplePluginApp
      basename={appBasePath}
      notifications={notifications}
      http={http}
      data={data}
      navigation={navigation}
      unifiedSearch={unifiedSearch}/>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
