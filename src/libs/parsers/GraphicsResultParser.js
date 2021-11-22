import Vue from 'vue';

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

      const width = Array(x.length).fill(x.length* 0.1);

      return [{
        type: "bar",
        orientation: "h",
        marker: {
          color: colors
        },
        x: x.reverse(),
        y: y.reverse(),
        width
      }];
    },
    layoutObject: {
      margin: {
        t: 20,
        b: 40
      },
      yaxis: {
        automargin: true,
        ticksuffix: ' '
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
    },
    layoutObject: {
      margin: {
        t: 50,
        b: 40
      }
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

      const trace = {
        type: "choropleth",
        locations,
        text,
        z,
        zmax: Math.max(...z),
        zmin: 0,
        hoverinfo: "text+z",
        colorbar: {
          thickness: 10,
          ypad: 50
        }
      }

      if (Array.isArray(colors)) {
        trace.colorscale = [[0, "#f3f3f3"]].concat(colors.map((color, index) => [((index + 1) / colors.length), color]));
      } else if (VALID_CHOROPLETH_COLORSCALE_NAMES.indexOf(colors) > -1) {
        trace.colorscale = colors;
        trace.reversescale = true;
      } else {
        trace.colorscale = "Blues";
        trace.reversescale = true;
      }

      return [trace];
    },
    layoutObject: {
      geo: {
        showframe: false,
        showcoastlines: false,
        countrywidth: 0.25,
        showcountries: true,
        projection: {
          type: "robinson",
        }
      },
      margin: {
        t: 0,
        r: -20,
        b: 0,
        l: 0
      }
    }
  }
};

function isCorrectVocabulary(vocabulary, name) {
  return vocabulary && (vocabulary.name === name || vocabulary.attributes.filter(a => a.key === "alias" && a.value === name)[0]);
}

function getPlotlyType(type) {
  if (type === 'bar' || type === 'horizontalBar') {
    return 'bar';
  } else if (type === 'pie' || type === 'doughnut') {
    return 'pie';
  } else if (type === 'choropleth') {
    return 'geo';
  }
}

export default class GraphicsResultParser {
  constructor(normalizePath) {
    this.normalizePath = normalizePath;
  }

  __parseForChart(chartData, options) {
    const studyVocabulary = (options.taxonomy || {vocabularies: []}).vocabularies.filter(vocabulary => isCorrectVocabulary(vocabulary, options.agg))[0];

    if (studyVocabulary) {
      const terms = studyVocabulary.terms.map(term => term.name);
      chartData.sort((a, b) => {
        return terms.indexOf(a.key) - terms.indexOf(b.key);
      });
    }

    const processor = DEFAULT_GRAPH_PROCESSORS[getPlotlyType(options.type || 'bar')];
    return [processor.processData({key: options.agg, values: chartData, title: options.title}, options.colors || options.backgroundColor), processor.layoutObject];
  }

  __parseForTable(vocabulary, chartData, forSubAggData) {
    return chartData.filter(term => term.count>0).map(term => {
      let row = {
        vocabulary: vocabulary.replace(/model-/, ""),
        key: term.key,
        title: term.title,
        count: term.count
      };

      if (forSubAggData) {
        const subAgg = term.aggs.filter((agg) => agg.aggregation === forSubAggData.agg)[0];
        row.subAgg = (subAgg[forSubAggData.dataKey] || {data: {}}).data[forSubAggData.data] || 0;
      }

      return row;
    });
  }

  parse(chartData, chartOptions, totalHits) {
    if (!chartData) {
      return;
    }

    const tr = Vue.filter('translate') || (value => value);
    const labelStudies = tr('studies');
    const aggData = chartData[chartOptions.dataKey];

    let [data, layout] = typeof chartOptions.parseForChart === 'function'
      ? chartOptions.parseForChart(aggData, chartOptions)
      : this.__parseForChart(aggData, chartOptions);

    const tableCols = [chartOptions.title, labelStudies];

    if (chartOptions.subAgg) {
      tableCols.push(chartOptions.subAgg.title);
    }

    const tableRows = typeof chartOptions.parseForTable === 'function'
      ? chartOptions.parseForTable(chartOptions.vocabulary, aggData, chartOptions.subAgg, totalHits)
      : this.__parseForTable(chartOptions.vocabulary, aggData, chartOptions.subAgg, totalHits);

    const plotData = {
      data: data,
      layout: layout
    };

    return [plotData, {cols: tableCols, rows: tableRows}];

  }

}
