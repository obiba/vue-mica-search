<template>
<div>
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-studies-result" class="table table-striped" width="100%">        
        <thead>
          <tr>
            <th rowspan="2">{{ tr("acronym") }}</th>
            <th rowspan="2">{{ tr("name") }}</th>
            <th rowspan="2">{{ tr("type") }}</th>
            <th rowspan="2">{{ tr("study-design") }}</th>
            <th colspan="4">{{ tr("data-sources-available") }}</th>
            <th rowspan="2">{{ tr("participants") }}</th>
            <th rowspan="2" v-if="withNetworks">{{ tr("networks") }}</th>
            <th colspan="2" v-if="withCollectedDatasets">{{ tr("individual") }}</th>
            <th colspan="2" v-if="withHarmonizedDatasets">{{ tr("harmonization") }}</th>
          </tr>
          <tr>
            <th><i class="fa fa-file-alt"></i></th>
            <th><i class="fa fa-stethoscope"></i></th>
            <th><i class="fa fa-flask"></i></th>
            <th><i class="far fa-plus-square"></i></th>
            <th v-if="withCollectedDatasets">{{ tr("datasets") }}</th>
            <th v-if="withCollectedDatasets">{{ tr("variables") }}</th>
            <th v-if="withHarmonizedDatasets">{{ tr("datasets") }}</th>
            <th v-if="withHarmonizedDatasets">{{ tr("variables") }}</th>
          </tr>
        </thead> 
      </table>
    </div>
  </div>

  <div v-show="loading">
    <img src="/assets/images/loading.gif">
  </div>

  <div v-show="!loading && !showResult">
    <span>{{ tr("no-study-found") }}</span>
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
