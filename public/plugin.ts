import { i18n } from '@kbn/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  KibanaExamplePluginPluginSetup,
  KibanaExamplePluginPluginStart,
  AppPluginStartDependencies,
  AppPluginSetupDependencies
} from './types';
import { PLUGIN_TITLE } from '../common';

export class KibanaExamplePluginPlugin
  implements Plugin<KibanaExamplePluginPluginSetup, KibanaExamplePluginPluginStart, AppPluginSetupDependencies, AppPluginStartDependencies>
{
  public setup(core: CoreSetup): KibanaExamplePluginPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'kibanaExamplePlugin',
      title: PLUGIN_TITLE,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // Return methods that should be available to other plugins
    return {
      getGreeting() {
        return i18n.translate('kibanaExamplePlugin.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_TITLE,
          },
        });
      },
    };
  }

  public start(core: CoreStart): KibanaExamplePluginPluginStart {
    return { };
  }

  public stop() {}
}
