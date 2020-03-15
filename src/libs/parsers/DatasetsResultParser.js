import $ from 'jquery';

export default class DatasetsResultParser {

  constructor() {
  }  

  parse(data, micaConfig) {
    const datasetsResult = data.datasetResultDto;

    this.showHits(data);
    
    if (!datasetsResult) {
      throw new Error("No dataset results available.");
    }

    if (datasetsResult.totalHits < 1) return { totalHits: 0};

    const result = datasetsResult["obiba.mica.DatasetResultDto.result"];

    if (!result) {
      throw new Error("Invalid JSON.");
    }

    let parsed = {
      data: [],
      totalHits: datasetsResult.totalHits
    }

    result.datasets.forEach(dataset => {
      const type = dataset.variableType === 'Dataschema' ? 'Harmonized' : 'Collected';
      const stats = dataset['obiba.mica.CountStatsDto.datasetCountStats'] || {};
      let anchor = (type, value) => `<a href="" class="query-anchor" data-target="dataset" data-target-id="${dataset.id}" data-type="${type}">${value}</a>`;
      
      let row = [
        `<a href="/dataset/${dataset.id}">${dataset.acronym[0].value}</a>`,
        dataset.name[0].value
      ];

      if (micaConfig.isCollectedDatasetEnabled && micaConfig.isHarmonizedDatasetEnabled) {
        row.push(type);
      }

      if (micaConfig.isNetworkEnabled && !micaConfig.isSingleNetworkEnabled) {
        row.push(stats.networks ? anchor('networks', stats.networks) : '-');
      }

      if (!micaConfig.isSingleStudyEnabled) {
        row.push(stats.studies ? anchor('studies', stats.studies) : '-');
      }

      row.push(stats.variables ? anchor('variables', stats.variables) : '-');

      parsed.data.push(row);
    });

    return parsed;
  }

  showHits(data) {
    if (data.variableResultDto && data.variableResultDto.totalHits) {
      $('#variable-count').text(data.variableResultDto.totalHits);
    } else {
      $('#variable-count').text(0);
    }
    if (data.datasetResultDto && data.datasetResultDto.totalHits) {
      $('#dataset-count').text(data.datasetResultDto.totalHits);
    } else {
      $('#dataset-count').text(0);
    }
    if (data.studyResultDto && data.studyResultDto.totalHits) {
      $('#study-count').text(data.studyResultDto.totalHits);
    } else {
      $('#study-count').text(0);
    }
    if (data.networkResultDto && data.networkResultDto.totalHits) {
      $('#network-count').text(data.networkResultDto.totalHits);
    } else {
      $('#network-count').text(0);
    }
  }
}

