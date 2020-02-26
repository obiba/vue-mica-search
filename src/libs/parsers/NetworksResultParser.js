export default class NetworksResultParser {

  constructor() {
  }  

  parse(data) {
    const networksResult = data.networkResultDto;

    if (!networksResult) {
      throw new Error("No network results available.");
    }

    const result = networksResult["obiba.mica.NetworkResultDto.result"];

    if (!result) {
      throw new Error("Invalid JSON.");
    }

    let parsed = {
      data: [],
      totalHits: networksResult.totalHits
    }

    result.networks.forEach(network => {
      const type = network.variableType === 'Dataschema' ? 'Harmonized' : 'Collected';
      const stats = network['obiba.mica.CountStatsDto.networkCountStats'] || {};

      parsed.data.push(
        [
          `<a href="/network/${network.id}">${network.acronym[0].value}</a>`,
          network.name[0].value,
          type,
          stats.studies || '-',
          stats.studyDatasets || '-',
          stats.harmonizationDatasets || '-',
          stats.studyVariables || '-',
          stats.dataschemaVariables || '-'
        ]
      );
    });

    return parsed;
  } 
}

