<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-variables-result" class="table table-bordered table-striped" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Label</th>
            <th>Annotations</th>
            <th v-if="withCollectedDataset && withHarmonizedDataset">Type</th>
            <th v-if="withStudies">Study</th>
            <th>Dataset</th>
          </tr>
        </thead>
      </table>
    </div>
  </div>

  <div v-show="!showResult">
    <span>No variable found</span>
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
