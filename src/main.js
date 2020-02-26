import VariablesResult from 'components/variables/VariablesResult.vue'
import DatasetsResult from 'components/datasets/DatasetsResult.vue'
import NetworksResult from 'components/networks/NetworksResult.vue'

function install(Vue, options) {
  VariablesResult.mixins = [options.mixin];
  Vue.component(VariablesResult.name, VariablesResult)

  DatasetsResult.mixins = [options.mixin];
  Vue.component(DatasetsResult.name, DatasetsResult)

  NetworksResult.mixins = [options.mixin];
  Vue.component(NetworksResult.name, NetworksResult)
}

export default install;
