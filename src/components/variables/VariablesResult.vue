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
    onDataReceived (payload) {
      if (!this.dataTable) return;
      console.log(`Page info ${this.dataTable.page.info()} ${payload}`);
      const parsed = this.parser.parse(payload);
      this.ajaxCallback(
        {
          data: parsed.data,
          recordsTotal: parsed.totalHits,
          recordsFiltered: parsed.totalHits
        }
      );
    }
  },
  mounted() {
    console.log('Varisbles Result Mounted...');
    this.getEventBus().register('query-result-received', this.onDataReceived.bind(this));

    this.dataTable = this.registerDataTable('vosr-var-result', {
      processing: true,
      columns: columns,
      serverSide: true,      
      ajax: (data, callback) => {
        if (this.ajaxCallback) {
          // this is called when paginating or page size is changed
          this.getEventBus().$emit('query-type-selection', {type: 'variables-list', from: data.start, size: data.length});
          // this.getEventBus().$emit('gimme-data', {from: data.start, size: data.length});
        } else {
          // first time table is registered
          this.ajaxCallback = callback;
        }
      }
    });
  },
  beforeDestroy() {
    // TODO seems to be never called 
    console.log('Varisbles will be destroyed...');
    this.getEventBus().unregister('query-result-received', this.onDataReceived)
  }
}
</script>
