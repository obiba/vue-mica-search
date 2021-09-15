<template>
  <div :id="aggregationName"></div>
</template>

<script>
import * as Plotly from "plotly.js-dist-min";

const VALID_CHOROPLETH_COLORSCALE_NAMES = ['Blackbody', 'Bluered', 'Blues', 'Cividis', 'Earth', 'Electric', 'Greens', 'Greys', 'Hot', 'Jet', 'Picnic', 'Portland', 'Rainbow', 'RdBu', 'Reds', 'Viridis', 'YlGnBu', 'YlOrRd'];

const DEFAULT_GRAPH_PROCESSORS = {
  bar: {
    /**
     * @param input
     * @param colors String or Array
     */
    processData(input, colors) {

      const x = [];
      const y = [];

      input.values.forEach(val => {
        x.push(val.count);
        y.push(val.title);
      });

      return [{
        type: "bar",
        orientation: "h",
        marker: {
          color: colors
        },
        x: x.reverse(),
        y: y.reverse()
      }];
    },
    layoutObject: {
      yaxis: {
        automargin: true
      }
    }
  },
  pie: {
    /**
     * @param input
     * @param colors Array
     */
    processData(input, colors) {
      const values = [];
      const labels = [];

      input.values.forEach(val => {
        values.push(val.count);
        labels.push(val.title);
      });

      return [{
        type: "pie",
        sort: false,
        marker: {
          colors: colors
        },
        hoverinfo: "label+value",
        values,
        labels
      }];
    }
  },
  geo: {
    /**
     * @param input
     * @param colors String or Array
     */
    processData(input, colors) {
      const z = [];
      const locations = [];
      const text = [];

      input.values.forEach(val => {
        z.push(val.count);
        locations.push(val.key);
        text.push(val.title);
      });

      return [{
        type: "choropleth",
        locations,
        text,
        z,
        zmax: Math.max(...z),
        zmin: 0,
        hoverinfo: "text+z",
        colorscale: Array.isArray(colors) ? [[0, "#f3f3f3"]].concat(colors.map((color, index) => [((index + 1) / colors.length), color])) : VALID_CHOROPLETH_COLORSCALE_NAMES.indexOf(colors) > -1 ? colors : "Blues",
        colorbar: {
          thickness: 10,
          ypad: 150
        }
      }];
    },
    layoutObject: {
      geo: {
        showframe: false,
        showcoastlines: false,
        countrywidth: 0.25,
        showcountries: true,
        projection: {
          type: "mercator",
        }
      },
      margin: {
        t: 0,
        r: 0,
        b: 0,
        l: 0
      }
    }
  }
};

function isCorrectVocabulary(vocabulary, name) {
  return vocabulary && (vocabulary.name === name || vocabulary.attributes.filter(a => a.key === "alias" && a.value === name)[0]);
}

export default {
  name: "search-graph",
  props: {
    aggregationName: String,
    customBundle: Object, // must containt 'processData' function that will take the study aggregation as param and 'layoutObject' object
    defaultGraphType: {
      type: String,
      default: "bar"
    },
    graphColors: [String, Array],
    lang: {
      type: String,
      default: "en"
    },
    studyResult: Object,
    studyTaxonomy: Object,
    useDefaults: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      totalHits: 0
    };
  },
  watch: {
    studyResult() {
      this.totalHits = (this.studyResult || {totalHits: 0}).totalHits || 0;

      if (this.totalHits) {
        const studyVocabulary = (this.studyTaxonomy || {vocabularies: []}).vocabularies.filter(vocabulary => isCorrectVocabulary(vocabulary, this.aggregationName))[0];
        const found = (this.studyResult || {aggs: []}).aggs.filter(item => this.aggregationName === item.aggregation)[0];

        if (this.useDefaults || !this.customBundle) {
          let values = (found["obiba.mica.TermsAggregationResultDto.terms"] || found["obiba.mica.RangeAggregationResultDto.ranges"]);

          if (studyVocabulary) {
            const terms = studyVocabulary.terms.map(term => term.name);
            values = values.sort((a, b) => {
              return terms.indexOf(a.key) - terms.indexOf(b.key);
            });
          }

          const data = DEFAULT_GRAPH_PROCESSORS[this.defaultGraphType].processData({
            key: found.aggregation,
            values: values,
            title: (found.title.filter(t => t.lang === this.lang)[0] || {}).value
          }, this.graphColors);

          Plotly.newPlot(this.aggregationName, data, DEFAULT_GRAPH_PROCESSORS[this.defaultGraphType].layoutObject)
        } else {
          Plotly.newPlot(this.aggregationName, this.customBundle.processData(found), this.customBundle.layoutObject)
        }
      }
    }
  }
}
</script>