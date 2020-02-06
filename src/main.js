import VariablesResult from './components/VariablesResult.vue'

function install (Vue, options) {
  VariablesResult.mixins = [options.mixin];
  Vue.component(VariablesResult.name, VariablesResult)
}

VariablesResult.install = install;

export default {
  VariablesResult
};
