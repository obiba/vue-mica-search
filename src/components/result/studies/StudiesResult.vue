<template>
<div>
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-studies-result" class="table table-striped" width="100%">        
        <thead>
          <tr>
            <th rowspan="2">{{ "acronym"  | translate }}</th>
            <th rowspan="2">{{ "name"  | translate }}</th>
            <th rowspan="2">{{ "type"  | translate }}</th>
            <th rowspan="2">{{ "study-design"  | translate }}</th>
            <th colspan="4">{{ "data-sources-available"  | translate }}</th>
            <th rowspan="2">{{ "participants"  | translate }}</th>
            <th rowspan="2" v-if="withNetworks">{{ "networks"  | translate }}</th>
            <th colspan="2" v-if="withCollectedDatasets">{{ "individual"  | translate }}</th>
            <th colspan="2" v-if="withHarmonizedDatasets">{{ "harmonization"  | translate }}</th>
          </tr>
          <tr>
            <th><i class="fa fa-file-alt"></i></th>
            <th><i class="fa fa-stethoscope"></i></th>
            <th><i class="fa fa-flask"></i></th>
            <th><i class="far fa-plus-square"></i></th>
            <th v-if="withCollectedDatasets">{{ "datasets"  | translate }}</th>
            <th v-if="withCollectedDatasets">{{ "variables"  | translate }}</th>
            <th v-if="withHarmonizedDatasets">{{ "datasets"  | translate }}</th>
            <th v-if="withHarmonizedDatasets">{{ "variables"  | translate }}</th>
          </tr>
        </thead> 
      </table>
    </div>
  </div>

  <div v-show="loading">
    <img src="/assets/images/loading.gif">
  </div>

  <div v-show="!loading && !showResult" class="text-muted">
    <span>{{ "no-study-found"  | translate }}</span>
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
      console.debug('Study onAnchorClicked');
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
    console.debug('Studies Result Mounted...');
    this.registerTable(); 
     
    $('#vosr-studies-result').on('click', 'a.query-anchor', this.onAnchorClicked);
  }
}
</script>
