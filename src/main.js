import VariablesResult from 'components/variables/VariablesResult.vue'
import DatasetsResult from 'components/datasets/DatasetsResult.vue'
import StudiesResult from 'components/studies/StudiesResult.vue'
import NetworksResult from 'components/networks/NetworksResult.vue'

import RqlQueryBuilder from 'components/builder/RqlQueryBuilder.vue'
import RqlPanel from 'components/panel/RqlPanel.vue'

function install(Vue, options) {
  VariablesResult.mixins = [options.mixin];
  Vue.component(VariablesResult.name, VariablesResult)

  DatasetsResult.mixins = [options.mixin];
  Vue.component(DatasetsResult.name, DatasetsResult)

  StudiesResult.mixins = [options.mixin];
  Vue.component(StudiesResult.name, StudiesResult)

  NetworksResult.mixins = [options.mixin];
  Vue.component(NetworksResult.name, NetworksResult)

  RqlQueryBuilder.mixins = [options.mixin];
  Vue.component('rql-query-builder', RqlQueryBuilder)

  RqlPanel.mixins = [options.mixin];
  Vue.component('rql-panel', RqlPanel)
}

export default install;
