import VariablesResult from 'components/result/variables/VariablesResult.vue'
import DatasetsResult from 'components/result/datasets/DatasetsResult.vue'
import StudiesResult from 'components/result/studies/StudiesResult.vue'
import NetworksResult from 'components/result/networks/NetworksResult.vue'
import CoverageResult from 'components/result/coverage/CoverageResult.vue'
import GraphicsResult from 'components/result/graphics/GraphicsResult.vue'
import GraphicResult from 'components/result/graphics/GraphicResult.vue'

import RqlQueryBuilder from 'components/builder/RqlQueryBuilder.vue'
import RqlPanel from 'components/panel/RqlPanel.vue'

import SearchGraph from 'components/search-graph/SearchGraph.vue'
import SearchGraphTable from 'components/search-graph/SearchGraphTable.vue'

function install(Vue, options) {
  VariablesResult.mixins = [options.mixin];
  Vue.component(VariablesResult.name, VariablesResult);

  DatasetsResult.mixins = [options.mixin];
  Vue.component(DatasetsResult.name, DatasetsResult);

  StudiesResult.mixins = [options.mixin];
  Vue.component(StudiesResult.name, StudiesResult);

  NetworksResult.mixins = [options.mixin];
  Vue.component(NetworksResult.name, NetworksResult);

  CoverageResult.mixins = [options.mixin];
  Vue.component(CoverageResult.name, CoverageResult);

  RqlQueryBuilder.mixins = [options.mixin];
  Vue.component('rql-query-builder', RqlQueryBuilder);

  RqlPanel.mixins = [options.mixin];
  Vue.component('rql-panel', RqlPanel);

  SearchGraph.mixins = [options.mixin];
  Vue.component('search-graph', SearchGraph);

  SearchGraphTable.mixins = [options.mixin];
  Vue.component('search-graph-table', SearchGraphTable);

  GraphicsResult.mixins = [options.mixin];
  GraphicResult.mixins = [options.mixin];
  Vue.component(GraphicsResult.name, GraphicsResult);
}

export default install;
