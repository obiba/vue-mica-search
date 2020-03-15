<template>
<div>
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-studies-result" class="table table-striped" width="100%">        
        <thead>
          <tr>
            <th rowspan="2">Acronym</th>
            <th rowspan="2">Name</th>
            <th rowspan="2">Type</th>
            <th rowspan="2">Study Design</th>
            <th colspan="4">Data Sources Available</th>
            <th rowspan="2">Participants</th>
            <th rowspan="2" v-if="withNetworks">Networks</th>
            <th colspan="2" v-if="withCollectedDatasets">Individual</th>
            <th colspan="2" v-if="withHarmonizedDatasets">Harmonization</th>
          </tr>
          <tr>
            <th><i class="fa fa-file-alt"></i></th>
            <th><i class="fa fa-stethoscope"></i></th>
            <th><i class="fa fa-flask"></i></th>
            <th><i class="far fa-plus-square"></i></th>
            <th v-if="withCollectedDatasets">Datasets</th>
            <th v-if="withCollectedDatasets">Variables</th>
            <th v-if="withHarmonizedDatasets">Datasets</th>
            <th v-if="withHarmonizedDatasets">Variables</th>
          </tr>
        </thead> 
      </table>
    </div>
  </div>

  <div v-show="!showResult">
    <span>No study found</span>
  </div>

</div>
</template>
<script>
import $ from 'jquery';
import Query from 'rql/src/query';
import EntityResult from 'components/result/EntityResult';
import StudiesResultParser from 'libs/parsers/StudiesResultParser';

export default {  
  name: 'StudiesResult',  
  extends: EntityResult,
  data () {
    return {
      parser: new StudiesResultParser(),
      type: "studies",
      target: "study"
    }
  },
  methods: {    
    onAnchorClicked(event) {
      console.log('Study onAnchorClicked');
      event.preventDefault();
      const anchor = $(event.target);
      const target = anchor.attr('data-target');
      const targetId = anchor.attr('data-target-id');
      const type = anchor.attr('data-type');
      const studyType = anchor.attr('data-study-type');

      const updates = [{target, query: new Query('in', ['Mica_study.id',targetId])}];

      if ("" !== studyType) {
        updates.push({target: 'study', query: new Query('in', ['Mica_study.className', studyType])});
      }

      this.getEventBus().$emit('query-type-updates-selection', {type: `${type}`, updates});
    }
  },
  mounted() {
    console.log('Studies Result Mounted...');
    this.registerTable(); 
     
    $('#vosr-studies-result').on('click', 'a.query-anchor', this.onAnchorClicked);
  }
}
</script>
