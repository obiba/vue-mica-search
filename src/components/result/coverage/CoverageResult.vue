<template>
  <div>
    <div class="row" v-show="showResult">
      <div class="col">
        <table v-if="table" id="vosr-coverage-result" class="table table-bordered table-striped">
          <thead>
            <tr>
              <th rowspan="{{bucketStartsWithDce ? 1 : 2}}" colspan="{{table.cols.colSpan}}">
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
              <!-- <th ng-if="bucketStartsWithDce && !singleStudy" translate>search.coverage-dce-cols.study</th> -->
              <th ng-if="bucketStartsWithDce" colspan="1" >search.coverage-dce-cols.population</th>
              <!-- <th ng-if="bucketStartsWithDce" colspan="{{choseHarmonization && !choseAll ? 2 : 1}}" translate>search.coverage-dce-cols.population</th> -->
              <!-- <th ng-if="bucketStartsWithDce" ng-hide="choseHarmonization && !choseAll" translate>search.coverage-dce-cols.dce</th> --> 

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
              <th colspan="{{table.cols.colSpan}}"></th>
              <th v-for="(header, index) in table.termHeaders" v-bind:key="index" v-bind:title="header.entity.descriptions[0].value">
                <a href ng-click="updateCriteria(null, header, $index, 'variables')">
                  <!-- <localized-number value="header.hits"></localized-number> -->
                  <span>{{header.hits}}</span>
                </a>
              </th>
            </tr>
          </thead>
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
      showResult: false
    };
  },
  methods: {
    onResults(payload) {     
      if (!this.dataTable) return;
      console.log('On coverage result', payload);

      this.showResult = (payload.response.rows || []).length > 0;
      this.bucket = payload.bucket;
      this.bucketStartsWithDce = payload.bucket.startsWith('dce')
      let headersData = this.parser.parseHeaders(payload.bucket, payload.response);
      this.table = headersData.table;
      this.vocabulariesTermsMap = headersData.vocabulariesTermsMap;

      console.log('Parse header result', headersData);

    }
  },
  mounted() {
    console.log('Mounted CoverageResult');
    this.dataTable = this.registerDataTable(`vosr-coverage-result`, {
      processing: true,
      // serverSide: true,
      // ajax: this.onAjaxCallback.bind(this),
      fixedHeader: true
    });
    this.getEventBus().register('coverage-results',this.onResults.bind(this));
  },
  beforeDestroy() {
    this.dataTable = null;
    this.getEventBus().unregister('coverage-results', this.onResults);
  }
};
</script>
