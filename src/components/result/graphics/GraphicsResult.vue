<template>
  <div>
    <div v-for="(chartDataset, index) in chartDatasets" v-bind:key="index">
      <graphic-result v-bind:chart-dataset="chartDataset" v-bind:total-hits="totalHits" v-bind:position="index" v-bind:hideHeader="hideHeader"></graphic-result>
    </div>
    <div id="vosr-charts-container">
    </div>
  </div>
</template>

<script>
import GraphicsResultParser from "libs/parsers/GraphicsResultParser";
import GraphicResult from "./GraphicResult.vue";

export default {
  name: "GraphicsResult",
  props: {
    chartOptions: Array,
    hideHeader: Boolean,
    taxonomy: Object
  },
  components: {
    GraphicResult
  },
  data() {
    return {
      totalHits: 0,
      chartDatasets: null,
      parser: new GraphicsResultParser(this.normalizePath),
    }
  },
  methods: {
    onResults(payload) {
      this.chartDatasets = []
      // TODO make sure any resultDto can be used
      const studyResult = payload.response.studyResultDto;
      this.totalHits = studyResult.totalHits;

      if (this.totalHits > 0) {
        this.chartOptions.forEach((options) => {
          const aggData = studyResult.aggs.filter((item => item.aggregation === options.agg)).pop();
          if (aggData) {
            if (this.taxonomy) {
              options.taxonomy = this.taxonomy;
            }

            const [plotData, tableData] = this.parser.parse(aggData, options, this.totalHits);
            if (tableData.rows.length>0) {
              this.chartDatasets.push({plotData, tableData, options});
            }
          }
        });
      }
    }
  },
  mounted() {
    console.debug(`Prop ${this.options} AGGS ${this.aggs}`);
    this.getEventBus().register('query-type-graphics-results',this.onResults.bind(this));
  },
  beforeDestroy() {
    this.getEventBus().unregister('query-type-graphics-results', this.onResults);
  }
}

</script>