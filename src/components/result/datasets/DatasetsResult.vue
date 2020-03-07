<template>
<div> 
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-datasets-result" class="table table-bordered table-striped" width="100%">
        <thead>
          <tr>
            <th>Acronym</th>
            <th>Name</th>
            <th>Type</th>
            <th>Networks</th>
            <th>Studies</th>
            <th>Variables</th>
          </tr>
        </thead>
      </table>
    </div>
  </div>

  <div v-show="!showResult">
    <span>No dataset found</span>
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
