<template>
 <div class="card card-primary card-outline">
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
        <div v-bind:id="chartContainerId" class="col-6">
          <!-- canvas element -->
        </div>
        <div v-bind:id="tableContainerId" class="col-6">
          <table id="vosr-datasets-result" class="table table-striped" width="100%">
            <thead>
              <tr>
                <th>{{ "value" | translate }}</th>
                <th>{{ "frequency" | translate }}</th>
              </tr>          
            </thead>
            <tbody>
                <tr v-for="(row, index) in chartDataset.tableRows" v-bind:key="index">
                  <td>{{row.title}}</td>
                  <td>{{row.count}}</td>
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
import $ from 'jquery';

export default {
  props: {
    position: Number,
    totalHits: Number,
    chartDataset: Object
  },
  data: function() {
    const agg = this.chartDataset.options.agg;
    return {
      containerId: `vosrs-charts-container-${this.position}`,
      chartContainerId: `vosrs-charts-${agg}-${this.position}`,
      tableContainerId: `vosrs-charts-${agg}-${this.position}-table`,
      canvasId: `vosrs-charts-${agg}-${this.position}-canvas`,
    }
  },
  methods: {
    renderCanvasAndTable() {      
      const chartContainer = $(`#${this.chartContainerId}`);
      chartContainer.children().remove();
      chartContainer.append(`<canvas id="${this.canvasId}" class="mb-4"></canvas>`);
      const chartCanvas = $(`#${this.canvasId}`).get(0).getContext('2d');

      new Chart(chartCanvas, this.chartDataset.canvasData);
    }
  },
  mounted() {
    this.renderCanvasAndTable();
  },
   watch: {
    chartDataset(val) {
      if (val) this.renderCanvasAndTable();
    }  
  }
}
</script>