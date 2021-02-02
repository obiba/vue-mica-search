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
    hideHeader: Boolean
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
            const [canvasData, tableData] = this.parser.parse(aggData, options);
            if (tableData.rows.length>0) {
              this.chartDatasets.push({canvasData, tableData, options});
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