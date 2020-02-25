<template>
<div> 
  <div class="row">
    <div class="col">      
      <table id="vosr-var-result" class="table table-bordered table-striped" width="100%">        
      </table>
    </div>
  </div>
</div>
</template>
<script>
import DataTable from 'datatables.net-dt' // eslint-disable-line no-unused-vars
import VariablesResultParser from 'libs/parsers/VariablesResultParser';

// TODO must be translatable
const columns = [
  {title: 'Name'},
  {title: 'Label'},
  {title: 'Annotations'},
  {title: 'Type'},
  {title: 'Study'},
  {title: 'Dataset'}
];

export default {  
  name: 'VariablesResult',  
  data () {
    return {
      dataTable: null,
      parser: new VariablesResultParser(),
      ajaxCallback: null
    }
  },
  methods: {
    onResults (payload) {
      if (!this.dataTable) return;     

      console.log("Page info ".concat(this.dataTable.page.info(), " ").concat(payload));
      const pageInfo = this.dataTable.page.info();
      var parsed = this.parser.parse(payload.response);
      this.ajaxCallback(
        {
          data: parsed.data,
          recordsTotal: parsed.totalHits,
          recordsFiltered: parsed.totalHits
        }
      );

      const start = payload.hasOwnProperty('from') ? payload.from : null;      
      if(start !== null && pageInfo.start !== start) {
        // The start has come from the query and not from pagination
        this.manualPagination = true;
        this.dataTable.page(start / pageInfo.length).draw(false);
        this.ajaxCallback(
          {
            data: parsed.data,
            recordsTotal: parsed.totalHits,
            recordsFiltered: parsed.totalHit  s
          }
        );        
      }
    },
    onAjaxCallback (data, callback) {
      if (this.ajaxCallback) {
        // this is called when paginating or page size is changed
        if (this.manualPagination) {
          this.manualPagination = false;
        } else {
          this.getEventBus().$emit('query-type-paginate', {display: 'list', type: 'variables', target: 'variable', from: data.start, size: data.length});
        }
        // this.getEventBus().$emit('gimme-data', {from: data.start, size: data.length});
      } else {
        // first time table is registered
        this.ajaxCallback = callback;
      }
    }
  },
  mounted() {
    console.log('Varisbles Result Mounted...');
    this.getEventBus().register('variables-results', this.onResults.bind(this));

    this.dataTable = this.registerDataTable('vosr-var-result', {
      processing: true,
      columns: columns,
      serverSide: true,      
      ajax: this.onAjaxCallback.bind(this)
    });
  },
  beforeDestroy() {
    // TODO seems to be never called 
    console.log('Varisbles will be destroyed...');
    this.dataTable = null;
    this.getEventBus().unregister('variables-results', this.onResults)
  }
}
</script>
