import Vue from 'vue';

export default class GraphicsResultParser {
  constructor(normalizePath) {
    this.normalizePath = normalizePath;
  }

  __parseForChart(chartData) {
    let labels = [];
    let data = [];

    chartData.forEach(term => {
      labels.push(term.title);
      data.push(term.count);
    });

    return [labels, data];
  }

  __parseForTable(vocabulary, chartData) {
    return chartData.map(term => {
      let row = {
        vocabulary: vocabulary.replace(/model-/, ""),
        key: term.key,
        title: term.title,
        count: term.count        
      };

      return row;
    });
  }  

  parse(chartData, chartOptions) {
    if (!chartData) {
      return;
    }

    const tr = Vue.filter('translate') || (value => value);
    const labelStudies = tr('studies');
    const aggData = chartData[chartOptions.dataKey];
    const [labels, data] = this.__parseForChart(aggData);
    const tableCols = [chartOptions.title, labelStudies];
    const tableRows = this.__parseForTable(chartOptions.vocabulary, aggData);

    const canvasData = {
      type: chartOptions.type,
      data: {
        labels: labels,
        datasets: [{
          label: labelStudies,
          data: data,
          backgroundColor: chartOptions.backgroundColor
        }]
      },
      options: {
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
        }
        
      }
    };

    return [canvasData, {cols: tableCols, rows: tableRows}];

  }

}