import './index.scss';

import { KibanaExamplePluginPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new KibanaExamplePluginPlugin();
}
export type { KibanaExamplePluginPluginSetup, KibanaExamplePluginPluginStart } from './types';
