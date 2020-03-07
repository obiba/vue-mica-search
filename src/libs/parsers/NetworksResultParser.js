export default class NetworksResultParser {

  constructor() {
  }  

  parse(data) {
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

      parsed.data.push(
        [
          `<a href="/network/${network.id}">${network.acronym[0].value}</a>`,
          network.name[0].value,
          stats.studies ? anchor('studies', stats.studies, "") : '-',
          stats.studyDatasets ? anchor('datasets', stats.studyDatasets, 'Study') : '-',
          stats.harmonizationDatasets ? anchor('datasets', stats.harmonizationDatasets, 'HarmonizationStudy') : '-',
          stats.studyVariables ? anchor('variables', stats.studyVariables, 'Study') : '-',
          stats.dataschemaVariables ? anchor('variables', stats.dataschemaVariables, 'HarmonizationStudy') : '-'
        ]
      );
    });

    return parsed;
  } 
}

