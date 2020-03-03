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
      let anchor = (type, value) => `<a href="" data-target="dataset" data-target-id="${dataset.id}" data-type="${type}">${value}</a>`;
      parsed.data.push(
        [
          `<a href="/dataset/${dataset.id}">${dataset.acronym[0].value}</a>`,
          dataset.name[0].value,
          type,
          stats.networks ? anchor('networks', stats.networks) : '-',
          stats.studies ? anchor('studies', stats.studies) : '-',
          stats.variables ? anchor('variables', stats.variables) : '-'
        ]
      );
    });

    return parsed;
  } 
}

