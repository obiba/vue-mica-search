<template>
  <div v-bind:id="cardId" class="card card-primary card-outline">
    <div v-if="!hideHeader" class="card-header">
      <h3 class="card-title">{{chartDataset.options.title | translate}}</h3>
      <div class="card-tools float-right">
        <button type="button" class="btn btn-tool" data-card-widget="collapse" data-toggle="tooltip" v-bind:title="'collapse' | translate">
          <i class="fas fa-minus"></i>
        </button>
        </div>
    </div>
    <div class="card-body">
      <p class="text-muted">{{chartDataset.options.text | translate}}</p>
      <div v-bind:id="containerId" class="row">
        <div v-bind:id="chartContainerId" class="col-sm-12 col-xl-6 my-auto">
          <!-- canvas element -->
        </div>
        <div v-bind:id="tableContainerId" class="col-sm-12 col-xl-6 overflow-auto" style="max-height: 24em">
          <table id="vosr-datasets-result" class="table table-striped" width="100%">
            <thead>
              <tr class="row" v-on:click.prevent="resetSort()">
                <th class="col" v-for="(col, index) in chartDataset.tableData.cols" v-bind:key="index">
                  <span>{{ col }}</span>
                  <button v-if="chartDataset.options.withSort" v-on:click.stop="toggleSortColumn(index)" type="button" class="btn btn-xs ml-1"><i :class="'fas fa-' + sortClass(index)"></i></button>
                </th>
              </tr>          
            </thead>
            <tbody>
                <tr class="row" v-for="(row, index) in rows" v-bind:key="index">
                  <td class="col">{{row.title}}</td>

                  <td class="col" v-bind:title="totals ? (100 * row.count/totals.countTotal).toFixed(2) + '%' : ''" v-if="row.count > 0">
                    <a href="" v-on:mouseover="showTooltip(row)" v-on:mouseout=hideTooltip()  v-on:click="onCountClick($event, row.vocabulary, row.key, row.queryOverride)" class="query-anchor">{{row.count}}</a> 
                    <small class="ml-1" v-if="chartDataset.options.withTotals && chartDataset.options.withPercentages">({{totals ? (100 * row.count/totals.countTotal).toFixed(2) + '%' : ''}})</small>
                  </td>

                  <td class="col" v-bind:title="totals ? (0).toFixed(2) + '%' : ''" v-if="row.count === 0">
                    <span class="text-muted">{{row.count}}</span> 
                    <small v-if="chartDataset.options.withTotals && chartDataset.options.withPercentages" class="ml-1 text-muted">({{totals ? (0).toFixed(2) + '%' : ''}})</small>
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
                    <small class="ml-1" v-if="chartDataset.options.withTotals && chartDataset.options.withPercentages">({{(100).toFixed(2) + '%'}})</small></th>
                  <th class="col" v-if="totals.subAggTotal !== undefined">{{totals.subAggTotal.toLocaleString()}}</th>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';
import 'chartjs-chart-geo';
import $ from 'jquery';
import Query from 'rql/src/query';

export default {
  props: {
    position: Number,
    totalHits: Number,
    chartDataset: Object,
    hideHeader: Boolean
  },
  data: function() {
    const agg = this.chartDataset.options.agg;

    let totals = this.chartDataset.options.withTotals ? {countTotal: 0, subAggTotal: 0} : null;

    if (this.chartDataset.options.withTotals) {
      this.chartDataset.tableData.rows.forEach(row => {
        totals.countTotal += row.count;
        if (row.subAgg !== undefined) {
          totals.subAggTotal += row.subAgg;
        } else {
          totals.subAggTotal = undefined;
        }
      });
    } 

    return {
      chart: null,
      cardId: this.chartDataset.options.id,
      containerId: `vosrs-charts-container-${this.position}`,
      chartContainerId: `vosrs-charts-${agg}-${this.position}`,
      tableContainerId: `vosrs-charts-${agg}-${this.position}-table`,
      canvasId: `vosrs-charts-${agg}-${this.position}-canvas`,
      totals: totals,
      rows: this.chartDataset.tableData.rows.map(r => r),
      sort: {
        index: undefined,
        direction: undefined
      }
    }
  },
  methods: {
    showTooltip(row) {      
      const meta = this.chart.getDatasetMeta(0);
      let data = null;
      if (meta.type === 'choropleth') {
        // Geo chart
        data = meta.data.filter(d => d.feature.id === row.key).pop();
      } else {
        const index = this.chartDataset.tableData.rows.indexOf(row);
        if (index > -1) data = meta.data[index];
      }
      if (!data) return;

      this.chart.tooltip._active = [data];
      this.chart.tooltip.update(true);
      this.chart.draw();
    },
    hideTooltip() {
      this.chart.tooltip._active = [];
      this.chart.tooltip.update(true);
      this.chart.draw();
    },
    renderCanvas() {      
      const chartContainer = $(`#${this.chartContainerId}`);
      chartContainer.children().remove();
      chartContainer.append(`<canvas id="${this.canvasId}" class="mb-4"></canvas>`);
      const chartCanvas = $(`#${this.canvasId}`).get(0).getContext('2d');
      this.chart = new Chart(chartCanvas, this.chartDataset.canvasData);
    },
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

      this.rows = this.chartDataset.tableData.rows.map(r => r);
    },
    sortClass(index) {
      if (this.sort.index !== index) {
        return 'sort';
      } else {
        return `sort-${this.sort.direction}`;
      }
    },
    toggleSortColumn(index) {
      if (this.sort.index !== index) {
        this.sort.index = index;
        this.sort.direction = 'up';
      } else {
        this.sort.direction = this.sort.direction === 'up' ? 'down' : 'up';
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
  mounted() {
    this.renderCanvas();
  },
   watch: {
    chartDataset(val) {
      if (val) this.renderCanvas();
    }  
  }
}
</script>