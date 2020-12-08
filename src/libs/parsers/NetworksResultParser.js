export default class NetworksResultParser {

  constructor(normalizePath) {
    this.normalizePath = normalizePath;
  }

  parse(data, micaConfig, localize, displayOptions) {
    const networksResult = data.networkResultDto;
    
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

      let path = this.normalizePath(`/network/${network.id}`);
      let row = [`<a href="${path}">${localize(network.acronym)}</a>`];

      displayOptions.networkColumns.forEach(column => {
        switch (column) {
          case 'name': {
            row.push(localize(network.name));
            break;
          }
          case 'studies': {
            row.push(stats.studies ? anchor('studies', stats.studies, "") : '-');
            break;
          }
          case 'datasets': {
            if (micaConfig.isCollectedDatasetEnabled) {
              row.push(stats.studyDatasets ? anchor('datasets', stats.studyDatasets, 'Study') : '-');
            }
            if (micaConfig.isHarmonizedDatasetEnabled) {
              row.push(stats.harmonizationDatasets ? anchor('datasets', stats.harmonizationDatasets, 'HarmonizationStudy') : '-');
            }
            break;
          }
          case 'variables': {
            if (micaConfig.isCollectedDatasetEnabled) {
              row.push(stats.studyVariables ? anchor('variables', stats.studyVariables, 'Study') : '-');
            }
            if (micaConfig.isHarmonizedDatasetEnabled) {
              row.push(stats.dataschemaVariables ? anchor('variables', stats.dataschemaVariables, 'HarmonizationStudy') : '-');
            }
            break;
          }
          default:
            row.push('');
            console.debug('Wrong network table column: ' + column);
        }
      });

      parsed.data.push(row);
    });

    return parsed;
  }
}

