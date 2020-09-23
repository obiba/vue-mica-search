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

  __parseForTable(chartData) {
    return chartData.map(term => {
      let row = {
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
    const aggData = chartData[chartOptions.dataKey];
    const [labels, data] = this.__parseForChart(aggData);
    const tableRows = this.__parseForTable(aggData);

    // console.debug(chartData['obiba.mica.TermsAggregationResultDto.terms']);
    const canvasData = {
      type: chartOptions.type,
      data: {
        labels: labels,
        datasets: [{
          label: tr('studies'),
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

    return [canvasData, tableRows];

  }

}