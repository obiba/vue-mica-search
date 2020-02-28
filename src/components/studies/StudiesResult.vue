<template>
<div> 
  <div class="row">
    <div class="col">      
      <table id="vosr-studies-result" class="table table-bordered table-striped" width="100%">        
      </table>
    </div>
  </div>
</div>
</template>
<script>
import DataTable from 'datatables.net-dt' // eslint-disable-line no-unused-vars
import StudiesResultParser from 'libs/parsers/StudiesResultParser';

// TODO must be translatable
const columns = [
  {title: 'Acronym'},
  {title: 'Name'},
  {title: 'Type'},
  {title: 'Study Design'},
  {title: 'Data Sources'},
  {title: 'Participants'},
  {title: 'Networks'},
  {title: 'Individual Datasets'},
  {title: 'Individual Variables'},
  {title: 'Harmonization Datasets'},
  {title: 'Harmonization Variables'}
];

export default {  
  name: 'StudiesResult',  
  data () {
    return {
      dataTable: null,
      parser: new StudiesResultParser(),
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
            recordsFiltered: parsed.totalHits
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
          this.getEventBus().$emit('query-type-paginate', {display: 'list', type: 'studies', target: 'dataset', from: data.start, size: data.length});
        }
      } else {
        this.ajaxCallback = callback;
      }
    }
  },
  mounted() {
    console.log('Studies Result Mounted...');
    this.getEventBus().register('studies-results', this.onResults.bind(this));

    this.dataTable = this.registerDataTable('vosr-studies-result', {
      processing: true,
      columns: columns,
      serverSide: true,      
      ajax: this.onAjaxCallback.bind(this),
      fixedHeader: true
    });  
  },
  beforeDestroy() {
    // TODO seems to be never called 
    console.log('Studies will be destroyed...');
    this.dataTable = null;
    this.getEventBus().unregister('studies-results', this.onResults)
  }
}
</script>
