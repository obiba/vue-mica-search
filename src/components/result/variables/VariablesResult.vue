<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-variables-result" class="table table-striped" width="100%">
        <thead>
          <tr>
            <th>{{ tr("name") }}</th>
            <th>{{ tr("label") }}</th>
            <th>{{ tr("annotations") }}</th>
            <th v-if="withCollectedDatasets && withHarmonizedDatasets">{{ tr("type") }}</th>
            <th v-if="withStudies">{{ tr("study") }}</th>
            <th>{{ tr("dataset") }}</th>
          </tr>
        </thead>
      </table>
    </div>
  </div>

  <div v-show="loading">
    <img src="/assets/images/loading.gif">
  </div>

  <div v-show="!loading && !showResult">
    <span>{{ tr("no-variable-found") }}</span>
  </div>

</div>
</template>
<script>
import EntityResult from 'components/result/EntityResult';
import VariablesResultParser from 'libs/parsers/VariablesResultParser';

export default {  
  name: 'VariablesResult',  
  extends: EntityResult,
  data () {
    return {
      parser: new VariablesResultParser(),
      type: "variables",
      target: "variable"
    }
  },
  mounted() {
    this.registerTable();
  }
}
</script>
