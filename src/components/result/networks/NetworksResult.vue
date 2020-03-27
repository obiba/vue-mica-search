<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-networks-result" class="table table-striped" width="100%">       
        <thead v-if="withCollectedDatasets && withHarmonizedDatasets">
          <tr>
            <th rowspan="2">{{ "acronym" | translate }}</th>
            <th rowspan="2">{{ "name" | translate }}</th>
            <th rowspan="2">{{ "studies" | translate }}</th>
            <th colspan="2">{{ "datasets" | translate }}</th>
            <th colspan="2">{{ "variables" | translate }}</th>
          </tr>
          <tr>
            <th v-if="withCollectedDatasets">{{ "collected" | translate }}</th>
            <th v-if="withHarmonizedDatasets">{{ "harmonized" | translate }}</th>
            <th v-if="withCollectedDatasets">{{ "collected" | translate }}</th>
            <th v-if="withHarmonizedDatasets">{{ "harmonized" | translate }}</th>
          </tr>
        </thead>
        <thead v-else-if="withCollectedDatasets || withHarmonizedDatasets">
          <tr>
            <th>{{ "acronym" | translate }}</th>
            <th>{{ "name" | translate }}</th>
            <th>{{ "studies" | translate }}</th>
            <th>{{ "datasets" | translate }}</th>
            <th>{{ "variables" | translate }}</th>
          </tr>
        </thead>
        <thead v-else>
          <tr>
            <th>{{ "acronym" | translate }}</th>
            <th>{{ "name" | translate }}</th>
            <th>{{ "studies" | translate }}</th>
          </tr>
        </thead> 
      </table>
    </div>
  </div>

  <div v-show="loading">
    <img src="/assets/images/loading.gif">
  </div>

  <div v-show="!loading && !showResult" class="text-muted">
    <span>{{ "no-network-found" | translate }}</span>
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
