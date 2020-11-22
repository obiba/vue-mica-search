<template>
<div>
  <div v-show="showResult">
    <div class="row">
      <div class="col table-responsive">
        <table v-if="table" id="vosr-coverage-result" class="table table-striped" width="100%">
          <thead>
            <tr>
              <th v-bind:rowspan="bucketStartsWithDce ? 1 : 2" v-bind:colspan="table.cols.colSpan">
                {{ `coverage-buckets-${bucketName}` | translate}}
              </th>
              <th v-for="(header, index) in table.vocabularyHeaders" v-bind:key="index" v-bind:colspan="header.termsCount">
                <!-- TODO popover -->
                <span>{{ header.entity.titles | localize-string }} </span>
                <small>
                  <a href v-on:click="removeVocabulary($event, header)">
                    <i class="fa fa-times"></i>
                  </a>
                </small>
              </th>
            </tr>
            <tr>
              <th v-if="bucketStartsWithDce">{{ "study" | translate }}</th>
              <th v-if="bucketStartsWithDce" v-bind:colspan="studyTypeSelection.harmonization ? 2 : 1" >{{ "population" | translate }}</th>
              <th v-if="bucketStartsWithDce" v-show="!studyTypeSelection.harmonization">{{ "data-collection-event" | translate }}</th> 

              <th v-for="(header, index) in table.termHeaders" v-bind:key="index">
                <!-- TODO popover -->
                <span>{{ header.entity.titles | localize-string }} </span>
                <small>
                  <a ng-if="header.canRemove" href v-on:click="removeTerm($event, header)">
                    <i class="fa fa-times"></i>
                  </a>
                </small>
              </th>
            </tr>
            <tr>
              <th v-bind:colspan="table.cols.colSpan"></th>
              <th v-for="(header, index) in table.termHeaders" v-bind:key="index" v-bind:title="header.entity.descriptions[0].value">
                <a href v-on:click="updateQuery($event, null, header, 'variables')">
                  <span>{{header.hits.toLocaleString()}}</span>
                </a>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, rindex) in filteredRows" v-bind:key="rindex" v-show="table.termHeaders.length == row.hits.length">
              <td v-for="(col, cindex) in table.cols.ids[row.value]" 
                v-bind:key="cindex" 
                v-bind:colspan="cindex > 0 && studyTypeSelection.harmonization ? 2 : 1" 
                v-show="!(col.id === '-' && (isSingleStudyEnabled || studyTypeSelection.harmonization))">

                <span v-show="col.id === '-'">-</span>
                <a v-show="col.rowSpan !== 0  && col.id !== '-'" v-bind:href="col.url">{{col.title}}</a>
                <div style="text-align: center" v-show="col.start && bucketStartsWithDce">
                  <div>
                    <small class="help-block no-margin" v-show="col.end">
                      {{col.start}} {{'to' | translate }} {{col.end}}
                    </small>
                    <small class="help-block no-margin" v-show="!col.end">
                      {{col.start}}, {{'coverage-end-date-ongoing' | translate}}
                    </small>
                  </div>
                  <div class="progress no-margin" style="height: 0.5em">
                    <div class="progress-bar progress-bar-transparent progress-bar-thin" role="progressbar" aria-valuenow="{{::col.start}}" aria-valuemin="{{::col.min}}"
                      aria-valuemax="{{::col.start}}" v-bind:style="{'width': col.progressStart + '%'}">
                    </div>
                    <div v-bind:class="'progress-bar progress-bar-' + col.progressClass" role="progressbar" v-bind:aria-valuenow="col.current" v-bind:aria-valuemin="col.start"
                      v-bind:aria-valuemax="col.end ? col.end : col.current" v-bind:style="{'width': col.progress + '%'}">
                    </div>
                  </div>
                </div>
              </td>
              <td v-for="(h, hindex) in table.termHeaders" v-bind:key="'h'+hindex">
                <a href="" v-on:click="updateQuery($event, row.value, h, 'variables')">
                  <span class="badge badge-primary" v-show="row.hitsTitles[hindex]">{{row.hitsTitles[hindex]}}</span>
                </a>
                <span v-show="!row.hitsTitles[hindex]">0</span>
              </td>
            </tr>
          </tbody>
          
        </table>
      </div>
    </div>
  </div>
  <div v-show="!showResult" class="text-muted">
    <span>{{ "no-coverage-available" | translate }}</span>
  </div>
</div>
</template>
<script>
import Query from 'rql/src/query';
import CoverageResultParser from "libs/parsers/CoverageResultParser";

export default {
  name: "CoverageResult",  
  data() {
    return {
      studyTypeSelection: {all: true},
      isSingleStudyEnabled: false,
      dataTable: null,
      ajaxCallback: null,
      parser: new CoverageResultParser(this.getMicaConfig(), this.getLocale, this.normalizePath),
      table: null, 
      vocabulariesTermsMap: null,
      bucketStartsWithDce: false,
      showResult: false,
      filteredRows: []
    };
  },
  methods: {
    onResults(payload) {     
      console.debug('On coverage result');
      
      // Header initialization
      this.showResult = (payload.response.rows || []).length > 0;
      if (!this.showResult) return;
      this.isSingleStudyEnabled = this.getMicaConfig().isSingleStudyEnabled;
      this.studyTypeSelection = payload.studyTypeSelection;
      this.rows = payload.response.rows;
      this.filteredRows = this.rows;
      this.bucket = payload.bucket;
      this.bucketName = this.bucket.replace(/Id$/,"");
      this.bucketStartsWithDce = payload.bucket.startsWith('dce')
      let headersData = this.parser.parseHeaders(payload.bucket, payload.response);
      this.table = headersData.table;
      this.vocabulariesTermsMap = headersData.vocabulariesTermsMap;

      if (this.dataTable) {
        this.dataTable.destroy();
        this.dataTable = null;
      }
    },
    removeVocabulary(event, vocabulary) {
      console.debug(`removeVocabulary ${vocabulary}`);
      event.preventDefault();
      this.getEventBus().$emit('query-type-delete', {target: 'variable', query: new Query('exists', [`${vocabulary.taxonomyName}.${vocabulary.entity.name}`])});
    },
    removeTerm(event, term) {
      console.debug(`removeVocabulary ${term}`);
      event.preventDefault();

      const index = this.table.termHeaders.indexOf(term);
      this.table.termHeaders.splice(index, 1);
      const argsToKeep = this.table.termHeaders.map(term => term.entity.name);
      if (argsToKeep.length < 1) {
        this.getEventBus().$emit('query-type-delete', {target: 'variable', query: new Query('exists', [`${term.taxonomyName}.${term.vocabularyName}`])});
      } else {
        this.getEventBus().$emit('query-type-update', {target: 'variable', query: new Query('in', [`${term.taxonomyName}.${term.vocabularyName}`, argsToKeep])});
      }
    },
    updateQuery(event, id, term, type) {
      console.debug(`Id: ${id} Term: ${term} Type: ${type}`);

      event.preventDefault();
      const updates = [{
        target: 'variable', 
        query: new Query('in', [`${term.taxonomyName}.${term.vocabularyName}`, term.entity.name]),
        operator: 'or',
        reduceKey: `${term.taxonomyName}.${term.vocabularyName}`
      }];

      if (id !== null) {
        const bucketTargetMap = {
          studyId: {target: 'study', queryKey: 'Mica_study.id'},
          datasetId: {target: 'dataset', queryKey: 'Mica_dataset.id'},
          dceId: {target: 'variable', queryKey: 'Mica_variable.dceId'}
        };
        const targetData = bucketTargetMap[this.bucket];

        updates.push({target: targetData.target, query: new Query('in', [targetData.queryKey,id])});      
      }

      this.getEventBus().$emit('query-type-updates-selection', {display: 'lists', type: `${type}`, updates});

    }
  },
  mounted() {
    console.debug('Mounted CoverageResult');
    this.getEventBus().register('coverage-results',this.onResults.bind(this));
  },
  beforeDestroy() {
    this.dataTable = null;
    this.getEventBus().unregister('coverage-results', this.onResults);
  }
};
</script>
