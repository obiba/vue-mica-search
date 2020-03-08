<template>
<div> 
  <div class="row" v-show="showResult">
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

    <div v-show="!showResult">
      <span>No network found</span>
    </div>
  </div>
</div>
</template>
<script>
import $ from 'jquery';
import Query from 'rql/src/query';
import EntityResult from 'components/result/EntityResult';
import NetworksResultParser from 'libs/parsers/NetworksResultParser';

export default {  
  name: 'NetworksResult',  
  extends: EntityResult,
  data () {
    return {
      dataTable: null,
      parser: new NetworksResultParser(),
      type: "networks",
      target: "network"
    }
  },
  methods: {
    
    onAnchorClicked(event) {
      console.log('Network onAnchorClicked');
      event.preventDefault();
      const anchor = $(event.target);
      const target = anchor.attr('data-target');
      const targetId = anchor.attr('data-target-id');
      const type = anchor.attr('data-type');
      const studyType = anchor.attr('data-study-type');

      const updates = [{target, query: new Query('in', ['Mica_network.id',targetId])}];

      if ("" !== studyType) {
        updates.push({target: 'study', query: new Query('in', ['Mica_study.className', studyType])});
      }

      this.getEventBus().$emit('query-type-updates-selection', {type: `${type}`, updates});
    }
  },
  mounted() {
    console.log('Networks Result Mounted...');
    this.registerTable();  
    $('#vosr-networks-result').on('click', 'a.query-anchor', this.onAnchorClicked);
  }
}
</script>
