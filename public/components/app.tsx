import React, { useMemo, useState } from 'react';

import {
  EuiButton,
  EuiDataGrid,
  EuiDataGridCellValueElementProps,
  EuiFormLabel,
  EuiHorizontalRule,
  EuiPageTemplate,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { CoreStart } from '@kbn/core/public';
import {
  DataPublicPluginStart
} from '@kbn/data-plugin/public';
import type { DataView } from '@kbn/data-views-plugin/public';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, I18nProvider } from '@kbn/i18n-react';
import type { NavigationPublicPluginStart } from '@kbn/navigation-plugin/public';
import { BrowserRouter as Router } from '@kbn/shared-ux-router';
import { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';

import { PLUGIN_ID, PLUGIN_TITLE } from '../../common';

interface KibanaExamplePluginAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  data: DataPublicPluginStart;
  navigation: NavigationPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
}

export const KibanaExamplePluginApp = ({
  basename,
  notifications,
  http,
  data,
  navigation,
  unifiedSearch
}: KibanaExamplePluginAppDeps) => {

  const { IndexPatternSelect } = unifiedSearch.ui;
  const [dataView, setDataView] = useState<DataView | null>();
  const [rawData, setRawData] = useState<any>();
  const [columns, setColumns] = useState<{ id: string, displayAsText: string}[]>();
  const [visibleColumns, setVisibleColumns] = useState<string[]>();

  const doAsyncSearch = async (
    strategy?: string,
    sessionId?: string,
    addWarning: boolean = false,
    addError: boolean = false
  ) => {
    if (!dataView) {
      notifications.toasts.addWarning(
        i18n.translate('kibanaExamplePlugin.dataRequest', {
          defaultMessage: 'Select data view!',
        })
      );
      return;
    }

    // Construct the query portion of the search request
    const query = data.query.getEsQuery(dataView);

    if (addWarning) {
      query.bool.must.push({
        // @ts-ignore
        error_query: {
          indices: [
            {
              name: dataView.title,
              error_type: 'warning',
              message: 'Watch out!',
            },
          ],
        },
      });
    }
    if (addError) {
      query.bool.must.push({
        // @ts-ignore
        error_query: {
          indices: [
            {
              name: dataView.title,
              error_type: 'exception',
              message: 'Watch out!',
            },
          ],
        },
      });
    }

    const req = {
      params: {
        index: dataView.title,
        body: {
          query
        },
      },
      // Add a custom request parameter to be consumed by `MyStrategy`.
      ...(strategy ? { customParam: 'value' } : {}),
    };

    const abortController = new AbortController();

    data.search
      .search(req, {
        strategy,
        sessionId,
        abortSignal: abortController.signal,
      })
      .subscribe({
        next: (res) => {
          if (res.rawResponse.hits) {
            const columnNames = res.rawResponse.hits.total! > 0 ? 
              Object.keys(res.rawResponse.hits.hits[0]._source) : [];
            const columnDefs = columnNames.map( name => {
              return { id: name, displayAsText: name }
            });
            setColumns(columnDefs);
            setVisibleColumns(columnNames.slice(0, 5));

            // Note, does not support nested objects in source
            const newData = res.rawResponse.hits.hits.map((result) => {
              return result._source;
            });
            setRawData(newData);
          } else {
            setColumns([]);
            setVisibleColumns([]);
            setRawData([]);
          }
            notifications.toasts.addSuccess(
              {
                title: 'Query result',
                text: `Retrieved ${res.rawResponse.hits.total} documents.`,
              },
              {
                toastLifeTimeMs: 300000,
              }
            );
            if (res.warning) {
              notifications.toasts.addWarning({
                title: 'Warning',
                text: res.warning,
              });
            }
        },
        error: (e) => {
          data.search.showError(e);
        },
      });
  };

  const renderCellValue = useMemo(() => {
    return ({ rowIndex, columnId, setCellProps }: EuiDataGridCellValueElementProps) => {
      return <div>{rawData[rowIndex][columnId]}</div>;
    };
  }, [rawData]);

  const onClickHandler = () => {
    // Use the core http service to make a response to the server API.
    http.get('/api/kibana_example_plugin/example').then((res) => {
      // Trigger async search operation
      doAsyncSearch();
    });
  };

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            useDefaultBehaviors={true}
          />
          <EuiPageTemplate restrictWidth="1000px">
            <EuiPageTemplate.Header>
              <EuiTitle size="l">
                <h1>
                  <FormattedMessage
                    id="kibanaExamplePlugin.helloWorldText"
                    defaultMessage="{name}"
                    values={{ name: PLUGIN_TITLE }}
                  />
                </h1>
              </EuiTitle>
            </EuiPageTemplate.Header>
            <EuiPageTemplate.Section>
              <EuiTitle>
                <h2>
                  <FormattedMessage
                    id="kibanaExamplePlugin.congratulationsTitle"
                    defaultMessage="Sample data"
                  />
                </h2>
              </EuiTitle>
              <EuiText>
                <p>
                  <FormattedMessage
                    id="kibanaExamplePlugin.content"
                    defaultMessage="Select a data view to show data."
                  />
                </p>
                <EuiFormLabel>Data view</EuiFormLabel>
                <IndexPatternSelect
                  placeholder={i18n.translate('searchSessionExample.selectDataViewPlaceholder', {
                    defaultMessage: 'Select data view',
                  })}
                  indexPatternId={dataView?.id || ''}
                  onChange={async (dataViewId?: string) => {
                    if (dataViewId) {
                      const newDataView = await data.dataViews.get(dataViewId);
                      setDataView(newDataView);
                    } else {
                      setDataView(undefined);
                    }
                  }}
                  isClearable={false}
                  data-test-subj="dataViewSelector"
                />
                <EuiHorizontalRule />
                {rawData ? 
                <EuiDataGrid
                  columns={columns}
                  columnVisibility={{ visibleColumns, setVisibleColumns }}
                  rowCount={rawData.length}
                  renderCellValue={renderCellValue}
                /> : 
                <EuiText>
                  <p>
                    <FormattedMessage
                      id="kibanaExamplePlugin.no-data-message"
                      defaultMessage="No data available. Please select a data view."
                    />
                  </p>
                </EuiText>}
                <EuiHorizontalRule />
                <EuiButton type="button" size="s" onClick={onClickHandler}>
                  <FormattedMessage id="kibanaExamplePlugin.buttonText" defaultMessage="Get data" />
                </EuiButton>
              </EuiText>
            </EuiPageTemplate.Section>
          </EuiPageTemplate>
        </>
      </I18nProvider>
    </Router>
  );
};