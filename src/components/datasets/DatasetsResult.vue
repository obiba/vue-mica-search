<template>
<div> 
  <div class="row">
    <div class="col">      
      <table id="vosr-datasets-result" class="table table-bordered table-striped" width="100%">        
      </table>
    </div>
  </div>
</div>
</template>
<script>
import $ from 'jquery';
import Query from 'rql/src/query';
import DataTable from 'datatables.net-dt'; // eslint-disable-line no-unused-vars
import DatasetsResultParser from 'libs/parsers/DatasetsResultParser';

// TODO must be translatable
const columns = [
  {title: 'Acronym'},
  {title: 'Name'},
  {title: 'Type'},
  {title: 'Networks'},
  {title: 'Studies'},
  {title: 'Variables'}
];

export default {  
  name: 'DatasetsResult',  
  data () {
    return {
      dataTable: null,
      parser: new DatasetsResultParser(),
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
          this.getEventBus().$emit('query-type-paginate', {display: 'list', type: 'datasets', target: 'dataset', from: data.start, size: data.length});
        }
      } else {
        this.ajaxCallback = callback;
      }
    },
    onAnchorClicked(event) {
      event.preventDefault();
      const anchor = $(event.target);
      const query = new Query('in', ['Mica_dataset.id', `${anchor.attr('data-target-id')}`]);
      this.getEventBus().$emit(
        'query-type-update', 
        {
          type: `${anchor.attr('data-type')}`, 
          target: `${anchor.attr('data-target')}`, 
          query          
        });

      console.log(`${anchor.attr('data-target')} - ${anchor.attr('data-target-id')}`);
    }
  },
  mounted() {
    console.log('Varisbles Result Mounted...');
    this.getEventBus().register('datasets-results', this.onResults.bind(this));

    this.dataTable = this.registerDataTable('vosr-datasets-result', {
      processing: true,
      columns: columns,
      serverSide: true,      
      ajax: this.onAjaxCallback.bind(this),
      fixedHeader: true
    });

    $('#vosr-datasets-result').on('click', 'td', this.onAnchorClicked);

  },
  beforeDestroy() {
    // TODO seems to be never called 
    console.log('Datasets will be destroyed...');
    this.dataTable = null;
    this.getEventBus().unregister('datasets-results', this.onResults)
  }
}
</script>
