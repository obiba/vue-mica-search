<template>
  <div>
    <div class="row" v-show="showResult">
      <div class="col">
        <table v-if="table" id="vosr-coverage-result" class="table table-bordered table-striped" width="100%">
          <thead>
            <tr>
              <th v-bind:rowspan="bucketStartsWithDce ? 1 : 2" v-bind:colspan="table.cols.colSpan">
                {{'search.coverage-buckets.' + bucket}}
              </th>
              <th v-for="(header, index) in table.vocabularyHeaders" v-bind:key="index" v-bind:colspan="header.termsCount">
                <span uib-popover="{{header.entity.descriptions[0].value}}" popover-title="{{header.entity.titles[0].value}}" popover-placement="bottom"
                  popover-trigger="'mouseenter'">
                  {{header.entity.titles[0].value}}
                </span>
                <small>
                  <a href ng-click="removeVocabulary(header)">
                    <i class="fa fa-times"></i>
                  </a>
                </small>
              </th>
            </tr>
            <tr>
              <th v-if="bucketStartsWithDce">search.coverage-dce-cols.study</th>
              <th v-if="bucketStartsWithDce" colspan="1" >search.coverage-dce-cols.population</th>
              <!-- <th ng-if="bucketStartsWithDce" colspan="{{choseHarmonization && !choseAll ? 2 : 1}}" translate>search.coverage-dce-cols.population</th> -->
              <th v-if="bucketStartsWithDce">search.coverage-dce-cols.dce</th> 

              <th v-for="(header, index) in table.termHeaders" v-bind:key="index">
                <!-- <span uib-popover="{{header.entity.descriptions[0].value}}" popover-title="{{header.entity.titles[0].value}}" popover-placement="bottom"
                  popover-trigger="'mouseenter'">
                  {{header.entity.titles[0].value}}
                </span> -->
                <!-- <small>
                  <a ng-if="header.canRemove" href ng-click="removeTerm(header)">
                    <i class="fa fa-times"></i>
                  </a>
                </small> -->
                {{header.entity.titles[0].value}}
              </th>
            </tr>
            <!-- <tr ng-show="totalOptions.showInHeader"> -->
            <tr>
              <th v-bind:colspan="table.cols.colSpan"></th>
              <th v-for="(header, index) in table.termHeaders" v-bind:key="index" v-bind:title="header.entity.descriptions[0].value">
                <a href ng-click="updateCriteria(null, header, $index, 'variables')">
                  <!-- <localized-number value="header.hits"></localized-number> -->
                  <span>{{header.hits}}</span>
                </a>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, rindex) in filteredRows" v-bind:key="rindex" v-show="table.termHeaders.length == row.hits.length">
              <td v-for="(col, cindex) in table.cols.ids[row.value]" v-bind:key="cindex" colspan="1" v-show="col.id !== '-'">
                <span v-show="col.id === '-'">-</span>
                <a v-show="col.rowSpan !== 0  && col.id !== '-'" v-bind:href="col.url">{{col.title}}</a>
                <div style="text-align: center" v-show="col.start && bucketStartsWithDce">
                  <div>
                    <small class="help-block no-margin" v-show="col.end">
                      {{col.start}} {{'to' }} {{col.end}}
                    </small>
                    <small class="help-block no-margin" v-show="!col.end">
                      {{col.start}}, {{'search.coverage-end-date-ongoing'}}
                    </small>
                  </div>
                  <div class="progress no-margin">
                    <div class="progress-bar progress-bar-transparent progress-bar-thin" role="progressbar" aria-valuenow="{{::col.start}}" aria-valuemin="{{::col.min}}"
                      aria-valuemax="{{::col.start}}" v-bind:style="{'width': col.progressStart + '%'}">
                    </div>
                    <div v-bind:class="'progress-bar progress-bar-' + col.progressClass" role="progressbar" v-bind:aria-valuenow="col.current" v-bind:aria-valuemin="col.start"
                      v-bind:aria-valuemax="col.end ? col.end : col.current" v-bind:style="{'width': col.progress + '%'}">
                    </div>
                  </div>
                </div>
              </td>
              <td v-for="(h, hindex) in table.termHeaders" v-bind:key="hindex">
                <a href ng-click="updateCriteria(row.value, h, index, 'variables')">
                  <span class="badge badge-primary" v-show="row.hitsTitles[hindex]">{{row.hitsTitles[hindex]}}</span>
                </a>
                <span v-show="!row.hitsTitles[hindex]">0</span>
              </td>
            </tr>
          </tbody>
          
        </table>
      </div>
    </div>

    <div v-show="!showResult">
      <span>No coverage available</span>
    </div>
  </div>
</template>
<script>
import DataTable from "datatables.net-dt"; // eslint-disable-line no-unused-vars
import CoverageResultParser from "libs/parsers/CoverageResultParser";

export default {
  name: "CoverageResult",  
  data() {
    return {
      dataTable: null,
      ajaxCallback: null,
      parser: new CoverageResultParser(),
      table: null, 
      vocabulariesTermsMap: null,
      bucketStartsWithDce: false,
      showResult: false,
      filteredRows: []
    };
  },
  methods: {
    // onAjaxCallback( data, callback, settings ) {
    //   const totalRows = this.rows.length;
    //   this.filteredRows = this.rows.slice(data.start, data.start+data.length);

    //   setTimeout( () => {
    //       callback( {
    //           draw: data.draw,
    //           data: out,
    //           recordsTotal: totalRows,
    //           recordsFiltered: totalRows
    //       } );
    //   }, 50 );
    // },
    onResults(payload) {     
      console.log('On coverage result', payload);
      
      // Header initialization
      this.showResult = (payload.response.rows || []).length > 0;
      if (!this.showResult) return;

      this.rows = payload.response.rows;
      this.filteredRows = this.rows;
      this.bucket = payload.bucket;
      this.bucketStartsWithDce = payload.bucket.startsWith('dce')
      let headersData = this.parser.parseHeaders(payload.bucket, payload.response);
      this.table = headersData.table;
      this.vocabulariesTermsMap = headersData.vocabulariesTermsMap;
      console.log(JSON.stringify(this.table));

      if (this.dataTable) {
        this.dataTable.destroy();
        this.dataTable = null;
      }

      // table and rows initialization
      // this.dataTable = this.registerDataTable(`vosr-coverage-result`,  {
      //   serverSide: true,
      //   ordering: false,
      //   searching: false,
      //   ajax: this.onAjaxCallback.bind(this),
      //   scrollY: 20,
      //   scroller: {
      //     loadingIndicator: true
      //   }
      // }
    }
  },
  mounted() {
    console.log('Mounted CoverageResult');
    this.getEventBus().register('coverage-results',this.onResults.bind(this));
  },
  beforeDestroy() {
    this.dataTable = null;
    this.getEventBus().unregister('coverage-results', this.onResults);
  }
};
</script>
