<template>
  <table class="table table-striped" width="100%">
    <thead>
      <tr class="row" v-on:click.prevent="resetSort()">
        <th class="col" v-for="(col, index) in cols" v-bind:key="index">
          <span>{{ col }}</span>
          <button v-if="chartOptions.withSort" v-on:click.stop="toggleSortColumn(index)" type="button" class="btn btn-xs ml-1"><i :class="'fas fa-' + sortClass(index)"></i></button>
        </th>
      </tr>
    </thead>
    <tbody>
        <tr class="row" v-for="(row, index) in rows" v-bind:key="index">
          <td class="col">{{row.title}}</td>

          <td class="col" v-bind:title="totals ? (100 * row.count/totals.countTotal).toFixed(2) + '%' : ''" v-if="row.count > 0">
            <a href="" v-on:click="onCountClick($event, row.vocabulary, row.key, row.queryOverride)" class="query-anchor">{{row.count}}</a>
            <small class="ml-1" v-if="chartOptions.withTotals && chartOptions.withPercentages">({{totals ? (100 * row.count/totals.countTotal).toFixed(2) + '%' : ''}})</small>
          </td>

          <td class="col" v-bind:title="totals ? (0).toFixed(2) + '%' : ''" v-if="row.count === 0">
            <span class="text-muted">{{row.count}}</span>
            <small v-if="chartOptions.withTotals && chartOptions.withPercentages" class="ml-1 text-muted">({{totals ? (0).toFixed(2) + '%' : ''}})</small>
          </td>

          <td class="col" v-bind:title="totals ? (100 * row.subAgg/totals.subAggTotal).toFixed(2) + '%' : ''" v-if="row.subAgg !== undefined">
            <span v-bind:class="{ 'text-muted': row.subAgg !== undefined && row.subAgg === 0 }">{{row.subAgg !== undefined && row.subAgg === 0 ? '-' : row.subAgg.toLocaleString()}}</span>
          </td>
        </tr>
    </tbody>
    <tfoot v-if="totals">
      <tr class="row">
          <th class="col">{{ 'graphics.total' | translate }}</th>
          <th class="col">{{totals.countTotal.toLocaleString()}}
            <small class="ml-1" v-if="chartOptions.withTotals && chartOptions.withPercentages">({{(100).toFixed(2) + '%'}})</small></th>
          <th class="col" v-if="totals.subAggTotal !== undefined">{{totals.subAggTotal.toLocaleString()}}</th>
        </tr>
    </tfoot>
  </table>
</template>

<script>
import GraphicsResultParser from "libs/parsers/GraphicsResultParser";
import Query from 'rql/src/query';

export default {
  name: "search-graph-table",
  props: {
    chartOptions: Object,
    studyResult: Object
  },
  data() {
    return {
      totalHits: 0,
      parser: new GraphicsResultParser(this.normalizePath),
      cols: null,
      rows: null,
      totals: null,
      tableData: null,
      sort: {
        index: undefined,
        direction: undefined
      }
    };
  },
  methods: {
    onCountClick(event, vocabulary, term, queryOverride) {
      event.preventDefault();
      console.debug(`onCountClicked ${vocabulary}, ${term}`);

      const updates = [{
        target: 'study',
        query: new Query('in', ['Mica_study.className', 'Study']),
        operator: 'and'
      }];

      updates.push({target:'study', query: (queryOverride ? queryOverride : new Query('in', [`Mica_study.${vocabulary}`, `${term}`]))});

      this.getEventBus().$emit('query-type-updates-selection', {display: 'lists', type: `studies`, updates});
    },
    resetSort() {
      this.sort.index = null;
      this.sort.direction = null;

      this.rows = this.tableData.rows.map(r => r);
    },
    sortClass(index) {
      if (this.sort.index !== index) {
        return 'sort';
      } else {
        return `sort-${this.sort.direction}`;
      }
    },
    toggleSortColumn(index, goDown) {
      if (this.sort.index !== index) {
        this.sort.index = index;
        this.sort.direction = 'up';
      } else {
        this.sort.direction = this.sort.direction === 'up' ? 'down' : 'up';
      }

      if (goDown) {
        this.sort.direction = 'down';
      }

      const sortFields = ['title', 'count', 'subAgg'];

      this.rows.sort((rowA, rowB) => {
        let multiplier = 1;

        if (this.sort.direction === 'up') {
          multiplier = -1;
        }

        const a = rowA[sortFields[this.sort.index]];
        const b = rowB[sortFields[this.sort.index]];

        if (typeof a === 'number' || typeof b === 'number') {
          return (a - b) * multiplier;
        } else {
          return a.toString().localeCompare(b.toString()) * multiplier;
        }
      });
    }
  },
  watch: {
    studyResult() {
      this.totalHits = (this.studyResult || {totalHits: 0}).totalHits || 0;

      if (this.totalHits) {
        let totals = this.chartOptions.withTotals ? {countTotal: 0, subAggTotal: 0} : null;

        const aggData = this.studyResult.aggs.filter((item => item.aggregation === this.chartOptions.agg))[0];
        if (aggData) {
          const tableData = this.parser.parse(aggData, this.chartOptions, this.totalHits)[1];
          if (tableData.rows.length > 0) {
            this.tableData = tableData;
          }

          if (this.chartOptions.withTotals) {
            this.tableData.rows.forEach(row => {
              totals.countTotal += row.count;
              if (row.subAgg !== undefined) {
                totals.subAggTotal += row.subAgg;
              } else {
                totals.subAggTotal = undefined;
              }
            });
          }

          this.totals = totals;
          this.rows = tableData.rows.map(r => r);
          this.cols = tableData.cols;

          this.tableData = tableData;
        }
      }
    }
  }
}
</script>