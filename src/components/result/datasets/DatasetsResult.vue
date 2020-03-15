<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-datasets-result" class="table table-striped" width="100%">
        <thead>
          <tr>
            <th>{{ tr("acronym") }}</th>
            <th>{{ tr("name") }}</th>
            <th v-if="withCollectedDatasets && withHarmonizedDatasets">{{ tr("type") }}</th>
            <th v-if="withNetworks">{{ tr("networks") }}</th>
            <th v-if="withStudies">{{ tr("studies") }}</th>
            <th>{{ tr("variables") }}</th>
          </tr>
        </thead>
      </table>
    </div>
  </div>

  <div v-show="loading">
    <img src="/assets/images/loading.gif">
  </div>

  <div v-show="!loading && !showResult">
    <span>{{ tr("no-dataset-found") }}</span>
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
      parser: new DatasetsResultParser(),
      type: "datasets",
      target: "dataset"
    }
  },
  props: {
    micaConfig: String
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

      console.log(`${anchor.attr('data-target')} - ${anchor.attr('data-target-id')}`);
    }
  },
  mounted() {
    console.log('Datasets Result Mounted...');
    this.registerTable();
    $('#vosr-datasets-result').on('click', 'a.query-anchor', this.onAnchorClicked);
  }
}
</script>
