import VariablesResult from 'components/variables/VariablesResult.vue'

function install (Vue, options) {
  VariablesResult.mixins = [options.mixin];
  Vue.component(VariablesResult.name, VariablesResult)
}

VariablesResult.install = install;

export default {
  VariablesResult
};
