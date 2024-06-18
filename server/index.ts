import { PluginInitializerContext } from '../../../src/core/server';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export async function plugin(initializerContext: PluginInitializerContext) {
  const { KibanaExamplePluginPlugin } = await import('./plugin');
  return new KibanaExamplePluginPlugin(initializerContext);
}

export type { KibanaExamplePluginPluginSetup, KibanaExamplePluginPluginStart } from './types';
