import Vue from 'vue';

export default class GraphicsResultParser {
  constructor(normalizePath) {
    this.normalizePath = normalizePath;
  }

  __parseForChart(chartData) {
    let labels = [];
    let data = [];

    chartData.filter(term => term.count>0).forEach(term => {
      labels.push(term.title);
      data.push(term.count);
    });

    return [labels, { data: data }];
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
    let [labels, dataset] = typeof chartOptions.parseForChart === 'function' 
      ? chartOptions.parseForChart(aggData, chartOptions.vocabulary, totalHits) 
      : this.__parseForChart(aggData, chartOptions.vocabulary, totalHits);
    const tableCols = [chartOptions.title, labelStudies];

    if (chartOptions.subAgg) {
      tableCols.push(chartOptions.subAgg.title);
    }

    const tableRows = typeof chartOptions.parseForTable === 'function' 
      ? chartOptions.parseForTable(chartOptions.vocabulary, aggData, chartOptions.subAgg, totalHits) 
      : this.__parseForTable(chartOptions.vocabulary, aggData, chartOptions.subAgg, totalHits);

    if (!dataset.label) {
      dataset.label = labelStudies;
    }
    if (!dataset.backgroundColor) {
      dataset.backgroundColor = chartOptions.backgroundColor;
    }

    const options = chartOptions.options ? chartOptions.options : {
      indexAxis: 'y',
      // Elements options apply to all of the options unless overridden in a dataset
      // In this case, we are setting the border of each horizontal bar to be 2px wide
      elements: {
        rectangle: {
          borderWidth: 2,
        }
      },
      aspectRatio: 2,
      // maintainAspectRatio: false,
      responsive: true,
      legend: {
        ...{ display: false }, ...(chartOptions.legend || {})
      },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
            min: 0
          }
        }]
      }
    };

    const canvasData = {
      type: chartOptions.type,
      data: {
        labels: labels,
        datasets: [dataset]
      },
      options: options
    };

    return [canvasData, {cols: tableCols, rows: tableRows}];

  }

}