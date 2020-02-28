export default class DatasetsResultParser {

  constructor() {
  }  

  parse(data) {
    const datasetsResult = data.datasetResultDto;

    if (!datasetsResult) {
      throw new Error("No dataset results available.");
    }

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

      parsed.data.push(
        [
          `<a href="/dataset/${dataset.id}">${dataset.acronym[0].value}</a>`,
          dataset.name[0].value,
          type,
          stats.networks || '-',
          stats.studies || '-',
          stats.variables || '-'
        ]
      );
    });

    return parsed;
  } 
}

