import type { DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';
import type { NavigationPublicPluginStart } from '@kbn/navigation-plugin/public';

export interface KibanaExamplePluginPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface KibanaExamplePluginPluginStart { }

export interface AppPluginSetupDependencies { }

export interface AppPluginStartDependencies {
  data: DataPublicPluginStart;
  navigation: NavigationPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart
}
