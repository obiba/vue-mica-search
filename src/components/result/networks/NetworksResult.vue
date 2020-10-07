<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-networks-result" class="table table-striped" width="100%">       
        <thead v-if="withCollectedDatasets && withHarmonizedDatasets">
          <tr>
            <th rowspan="2">{{ "acronym" | translate }}</th>
            <th v-for="item in networkColumnItems" :key="item.name" 
              :rowspan="item.rowspan" 
              :colspan="item.colspan">
              {{ item.name | translate }}
            </th>
          </tr>
          <tr v-if="withCollectedDatasets || withHarmonizedDatasets">
            <th v-for="item in networkColumnItems2" :key="item.name">
              {{ item.name | translate }}
            </th>
          </tr>
        </thead>
        <thead v-else>
          <tr>
            <th>{{ "acronym" | translate }}</th>
            <th v-for="column in networkColumnNames" :key="column">{{ column | translate }}</th>
          </tr>
        </thead> 
      </table>
    </div>
  </div>

  <div v-show="loading">
    <div class="spinner-border spinner-border-sm" role="status"></div>
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
      parser: new NetworksResultParser(this.normalizePath),
      type: "networks",
      target: "network"
    }
  },
  methods: {
    
    onAnchorClicked(event) {
      console.debug('Network onAnchorClicked');
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
    console.debug('Networks Result Mounted...');
    this.registerTable();  
    $('#vosr-networks-result').on('click', 'a.query-anchor', this.onAnchorClicked);
  }
}
</script>
