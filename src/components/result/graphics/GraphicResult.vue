<template>
 <div v-bind:id="cardId" class="card card-primary card-outline">
  <div class="card-header">
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
        <div v-bind:id="chartContainerId" class="col-sm-6">
          <!-- canvas element -->
        </div>
        <div v-bind:id="tableContainerId" class="col-sm-6 overflow-auto" style="max-height: 30em">
          <table id="vosr-datasets-result" class="table table-striped" width="100%">
            <thead>
              <tr class="row">
                <th class="col" v-bind:class="{ 'text-right': index > 0 }" v-for="(col, index) in chartDataset.tableData.cols" v-bind:key="index">{{ col }}</th>
              </tr>          
            </thead>
            <tbody>
                <tr  class="row" v-for="(row, index) in chartDataset.tableData.rows" v-bind:key="index">
                  <td class="col">{{row.title}}</td>                  
                  <td class="col text-right" v-if="row.count > 0"><a href="" v-on:click="onCountClick($event,row.vocabulary, row.key)" class="query-anchor">{{row.count}}</a></td>
                  <td class="col text-right" v-if="row.count === 0"><span class="text-muted">{{row.count}}</span></td>
                  <td class="col text-right" v-if="row.subAgg !== undefined">{{row.subAgg}}</td>
                </tr>
            </tbody>
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
    chartDataset: Object
  },
  data: function() {
    const agg = this.chartDataset.options.agg;
    return {
      cardId: this.chartDataset.options.id,
      containerId: `vosrs-charts-container-${this.position}`,
      chartContainerId: `vosrs-charts-${agg}-${this.position}`,
      tableContainerId: `vosrs-charts-${agg}-${this.position}-table`,
      canvasId: `vosrs-charts-${agg}-${this.position}-canvas`,
    }
  },
  methods: {
    renderCanvas() {
      const chartContainer = $(`#${this.chartContainerId}`);
      chartContainer.children().remove();
      chartContainer.append(`<canvas id="${this.canvasId}" class="mb-4"></canvas>`);
      const chartCanvas = $(`#${this.canvasId}`).get(0).getContext('2d');
      new Chart(chartCanvas, this.chartDataset.canvasData);
    },
    onCountClick(event, vocabulary, term) {
      event.preventDefault();
      console.debug(`onCountClicked ${vocabulary}, ${term}`);

      const updates = [{
        target: 'study', 
        query: new Query('in', ['Mica_study.className', 'Study']),
        operator: 'and'
      }];

      updates.push({target:'study', query: new Query('in', [`Mica_study.${vocabulary}`, `${term}`])});

      this.getEventBus().$emit('query-type-updates-selection', {display: 'lists', type: `studies`, updates});
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