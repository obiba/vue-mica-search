<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-variables-result" class="table table-striped" width="100%">
        <thead>
          <tr>
            <th>{{ "name" | translate }}</th>
            <th>{{ "label"  | translate }}</th>
            <th>{{ "annotations" | translate }}</th>
            <th v-if="withCollectedDatasets && withHarmonizedDatasets">{{ "type" | translate }}</th>
            <th v-if="withStudies">{{ "study" | translate }}</th>
            <th>{{ "dataset" | translate }}</th>
          </tr>
        </thead>
      </table>
    </div>
  </div>

  <div v-show="loading">
    <img src="/assets/images/loading.gif">
  </div>

  <div v-show="!loading && !showResult" class="text-muted">
    <span>{{ "no-variable-found" | translate }}</span>
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
