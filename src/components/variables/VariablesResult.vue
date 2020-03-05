<template>
<div> 
  <div class="row">
    <div class="col">      
      <table id="vosr-variables-result" class="table table-bordered table-striped" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Label</th>
            <th>Annotations</th>
            <th>Type</th>
            <th>Study</th>
            <th>Dataset</th>
          </tr>
        </thead>
      </table>
    </div>
  </div>
</div>
</template>
<script>
import EntityResult from 'components/EntityResult';
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
