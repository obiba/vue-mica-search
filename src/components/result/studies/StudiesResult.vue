<template>
<div>
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-studies-result" class="table table-striped" width="100%">        
        <thead>
          <tr>
            <th class="column-acronym" rowspan="2">{{ "acronym"  | translate }}</th>
            <th v-for="(item, index) in studyColumnItems" :key="index"      
              :class="'column-'+ item.name"        
              :rowspan="item.rowspan" 
              :colspan="item.colspan">
              {{ item.name | translate }}
            </th>
          </tr>
          <tr>
            <th v-for="(item, index) in studyColumnItems2" :key="index" :class="'column-'+ item.name" :title="item.title | taxonomy-title">
             <span> 
              <i v-if="item.icon" :class="item.icon"></i>
              {{ item.name | translate }}
             </span>
            </th>
          </tr>
        </thead> 
      </table>
    </div>
  </div>

  <div v-show="loading">
    <div class="spinner-border spinner-border-sm" role="status"></div>
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
      parser: new StudiesResultParser(this.normalizePath),
      type: "studies",
      target: "study"
    }
  },
  computed:{
    // study headers, 1st row
    studyColumnItems: function() {
      return this.getDisplayOptions().studyColumns
        .filter(col => {
          if (col === 'type') {
            return this.withCollectedDatasets && this.withHarmonizedDatasets;
          } else if (col === 'networks') {
            return this.withNetworks;
          } else if (col === 'individual') {
            return this.withCollectedDatasets;
          } else if (col === 'harmonization') {
            return this.withHarmonizedDatasets;
          } else if (['datasets', 'variables'].includes(col)) {
            return this.withCollectedDatasets || this.withHarmonizedDatasets;
          }
          return true;
        })
        .map(col => {
          return {
            name: col,
            rowspan: (['name', 'type', 'study-design', 'participants', 'networks'].includes(col) ? 2 : 1), 
            colspan: (['name', 'type', 'study-design', 'participants', 'networks'].includes(col) ? 1 : (col === 'data-sources-available' ? 4 : 2))
          }
        });
    },
    // study headers, 2nd row
    studyColumnItems2: function() {
      const items2 = [];
      this.getDisplayOptions().studyColumns
        .filter(col => {
          if (col === 'individual') {
            return this.withCollectedDatasets;
          } else if (col === 'harmonization') {
            return this.withHarmonizedDatasets;
          } else if (['datasets', 'variables'].includes(col)) {
            return this.withCollectedDatasets || this.withHarmonizedDatasets;
          }
          return col === 'data-sources-available';
        })
        .forEach((col, id) => {
          if (['individual', 'harmonization'].includes(col)) {
            items2.push({id: id, name: 'datasets', title: ''});
            items2.push({id: id, name: 'variables', title: ''});  
          } else if (['datasets', 'variables'].includes(col)) {
            if (this.withCollectedDatasets) {
              items2.push({id: id, name: 'individual', title: ''});
            }
            if (this.withHarmonizedDatasets) {
              items2.push({id: id, name: 'harmonization', title: ''});
            }
          } else if (col === 'data-sources-available') {
            items2.push({
              id: id,
              title: 'Mica_study.populations-dataCollectionEvents-dataSources.questionnaires',
              icon: 'fa fa-file-alt'
              });
            items2.push({
              id: id,
              title: 'Mica_study.populations-dataCollectionEvents-dataSources.physical_measures',
              icon: 'fa fa-stethoscope'
              });
            items2.push({
              id: id,
              title: 'Mica_study.populations-dataCollectionEvents-dataSources.biological_samples',
              icon: 'fa fa-flask'
              });
            items2.push({
              id: id,
              title: 'Mica_study.populations-dataCollectionEvents-dataSources.others',
              icon: 'far fa-plus-square'
              });
          }
        });
      return items2;
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
