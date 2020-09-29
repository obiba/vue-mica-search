<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-variables-result" class="table table-striped" width="100%">
        <thead>
          <tr>
            <th>{{ "name" | translate }}</th>
            <th v-for="column in variableColumnNames" :key="column">{{ column | translate }}</th>
          </tr>
        </thead>
      </table>
    </div>
  </div>

  <div v-show="loading">
    <div class="spinner-border spinner-border-sm" role="status"></div>
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
      parser: new VariablesResultParser(this.normalizePath),
      type: "variables",
      target: "variable" 
    }
  },
  mounted() {
    this.registerTable();
  }
}
</script>
