<template>
<div>
  <div class="row" v-show="showResult">
    <div class="col">      
      <table id="vosr-studies-result" class="table table-striped" width="100%">        
        <thead>
          <tr>
            <th rowspan="2">{{ "acronym"  | translate }}</th>
            <th v-for="item in studyColumnItems" :key="item.name" 
              :rowspan="item.rowspan" 
              :colspan="item.colspan">
              {{ item.name | translate }}
            </th>
          </tr>
          <tr>
            <th v-for="item in studyColumnItems2" :key="item.id" :title="item.title | taxonomy-title">
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
