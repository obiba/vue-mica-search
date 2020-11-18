<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-variables-result" class="table table-striped" width="100%">
        <thead>
          <tr>
            <th><i class="far fa-square"></i></th>
            <th></th>
            <th>{{ "name" | translate }}</th>
            <th v-for="(column, index) in variableColumnNames" :key="index">{{ column | translate }}</th>
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
  methods: {
    registerTable() { // override registerTable to add checkbox specific options
      this.dataTable = this.registerDataTable(`vosr-${this.type}-result`, {
        processing: true,
        serverSide: true,
        ajax: this.onAjaxCallback.bind(this),
        fixedHeader: true,
        isSelected: this.isSelected.bind(this),
        onSelectionChanged: this.onSelectionChanged.bind(this),
        columnDefs: [{ // the checkbox
          orderable: false,
          className: 'select-checkbox',
          targets: 0
        }, { // the ID
            visible: false,
            searchable: false,
            targets: 1
        }],
        select: {
          style: 'multi',
          selector: 'td:first-child',
          info: false
        }
      });
    }
  },
  computed: {
    // table headers
    variableColumnNames: function() {
      return this.getDisplayOptions().variableColumns
        .filter(col => {
          if (col === 'type') {
            return this.withCollectedDatasets && this.withHarmonizedDatasets;
          } else if (col === 'study') {
            return this.withStudies;
          }
          return true;
        })
        .map(col => col === 'label+description' ? 'label' : col);
    }
  },
  mounted() {
    this.registerTable();
  }
}
</script>
