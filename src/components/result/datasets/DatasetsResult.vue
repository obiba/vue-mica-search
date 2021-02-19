<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-datasets-result" class="table table-striped" width="100%">
        <thead>
          <tr>
            <th class="column-acronym" >{{ "acronym" | translate }}</th>
            <th v-for="(column, index) in datasetColumnNames" :key="index" :class="'column-' + column">{{ column | translate }}</th>
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
import EntityResult from 'components/result/EntityResult';
import DatasetsResultParser from 'libs/parsers/DatasetsResultParser';

export default {  
  name: 'DatasetsResult',  
  extends: EntityResult,
  data () {
    return {
      parser: new DatasetsResultParser(this.normalizePath, this.getLocale()),
      type: "datasets",
      target: "dataset"
    }
  },
  props: {
    micaConfig: String
  },
  computed: {
    // dataset headers
    datasetColumnNames: function() {
      return this.getDisplayOptions().datasetColumns
        .filter(col => {
          if (col === 'type') {
            return this.withCollectedDatasets && this.withHarmonizedDatasets;
          } else if (col === 'networks') {
            return this.withNetworks;
          } else if (col === 'studies') {
            return this.withStudies;
          }
          return true;
        });
    },
  },
  methods: {
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

      console.debug(`${anchor.attr('data-target')} - ${anchor.attr('data-target-id')}`);
    }
  },
  mounted() {
    console.debug('Datasets Result Mounted...');
    this.registerTable();
    $('#vosr-datasets-result').on('click', 'a.query-anchor', this.onAnchorClicked);
  }
}
</script>
