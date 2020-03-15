import $ from 'jquery';

export default class NetworksResultParser {

  constructor() {
  }  

  parse(data, micaConfig) {
    const networksResult = data.networkResultDto;

    this.showHits(data);
    
    if (!networksResult) {
      throw new Error("No network results available.");
    }

    if (networksResult.totalHits < 1) return { totalHits: 0};

    const result = networksResult["obiba.mica.NetworkResultDto.result"];

    if (!result) {
      throw new Error("Invalid JSON.");
    }

    let parsed = {
      data: [],
      totalHits: networksResult.totalHits
    }
    
    result.networks.forEach(network => {
      const stats = network['obiba.mica.CountStatsDto.networkCountStats'] || {};
      let anchor = (type, value, studyType) => `<a href="" class="query-anchor" data-study-type="${studyType}" data-target="network" data-target-id="${network.id}" data-type="${type}">${value}</a>`;

      let row = [
        `<a href="/network/${network.id}">${network.acronym[0].value}</a>`,
        network.name[0].value,
        stats.studies ? anchor('studies', stats.studies, "") : '-'
      ];
  
      if (micaConfig.isCollectedDatasetEnabled) {
        row.push(stats.studyDatasets ? anchor('datasets', stats.studyDatasets, 'Study') : '-');
      }
  
      if (micaConfig.isHarmonizedDatasetEnabled) {
        row.push(stats.harmonizationDatasets ? anchor('datasets', stats.harmonizationDatasets, 'HarmonizationStudy') : '-');
      }
  
      if (micaConfig.isCollectedDatasetEnabled) {
        row.push(stats.studyVariables ? anchor('variables', stats.studyVariables, 'Study') : '-');
      }
  
      if (micaConfig.isHarmonizedDatasetEnabled) {
        row.push(stats.dataschemaVariables ? anchor('variables', stats.dataschemaVariables, 'HarmonizationStudy') : '-');
      }

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

