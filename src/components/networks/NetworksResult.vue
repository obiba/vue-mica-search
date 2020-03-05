<template>
<div> 
  <div class="row">
    <div class="col">      
      <table id="vosr-networks-result" class="table table-bordered table-striped" width="100%">       
        <thead>
          <tr>
            <th rowspan="2">Acronym</th>
            <th rowspan="2">Name</th>
            <th rowspan="2">Studies</th>
            <th colspan="2">Datasets</th>
            <th colspan="2">Variables</th>
          </tr>
          <tr>
            <th>Collected</th>
            <th>Harmonized</th>
            <th>Collected</th>
            <th>Harmonized</th>
          </tr>
        </thead> 
      </table>
    </div>
  </div>
</div>
</template>
<script>
import $ from 'jquery';
import Query from 'rql/src/query';
import DataTable from 'datatables.net-dt' // eslint-disable-line no-unused-vars
import NetworksResultParser from 'libs/parsers/NetworksResultParser';

export default {  
  name: 'NetworksResult',  
  data () {
    return {
      dataTable: null,
      parser: new NetworksResultParser(),
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
          this.getEventBus().$emit('query-type-paginate', {display: 'list', type: 'networks', target: 'dataset', from: data.start, size: data.length});
        }
      } else {
        this.ajaxCallback = callback;
      }
    },
    onAnchorClicked(event) {
      console.log('Network onAnchorClicked');
      event.preventDefault();
      const anchor = $(event.target);
      const target = anchor.attr('data-target');
      const targetId = anchor.attr('data-target-id');
      const type = anchor.attr('data-type');
      const studyType = anchor.attr('data-study-type');

      console.log(`Target ${target} TargetID ${targetId} Type ${type} Study Type ${studyType}`);

      const updates = [{target, query: new Query('in', ['Mica_network.id',targetId])}];

      if ("" !== studyType) {
        updates.push({target: 'study', query: new Query('in', ['Mica_study.className', studyType])});
      }

      this.getEventBus().$emit('query-type-updates-selection', {type: `${type}`, updates});

      console.log(`${anchor.attr('data-target')} - ${anchor.attr('data-target-id')}`);
    }
  },
  mounted() {
    console.log('Networks Result Mounted...');
    this.getEventBus().register('networks-results', this.onResults.bind(this));

    this.dataTable = this.registerDataTable('vosr-networks-result', {
      processing: true,
      serverSide: true,      
      ajax: this.onAjaxCallback.bind(this),
      fixedHeader: true
    });  

    $('#vosr-networks-result').on('click', 'td', this.onAnchorClicked);

  },
  beforeDestroy() {
    // TODO seems to be never called 
    console.log('Networks will be destroyed...');
    this.dataTable = null;
    this.getEventBus().unregister('networks-results', this.onResults)
  }
}
</script>
