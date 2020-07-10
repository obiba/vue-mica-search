import Vue from 'vue';

export default class DatasetsResultParser {

  constructor(normalizePath) {
    this.normalizePath = normalizePath;
  }

  parse(data, micaConfig) {
    const datasetsResult = data.datasetResultDto;
    const tr = Vue.filter('translate') || (value => value);
    const taxonomyFilter = Vue.filter('taxonomy-title') || (value => value);
    
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
      const type = dataset.variableType === 'Dataschema' 
        ? taxonomyFilter.apply(null, ['Mica_dataset.className.HarmonizationDataset'])
        : taxonomyFilter.apply(null, ['Mica_dataset.className.StudyDataset']) ;

      const stats = dataset['obiba.mica.CountStatsDto.datasetCountStats'] || {};
      let anchor = (type, value) => `<a href="" class="query-anchor" data-target="dataset" data-target-id="${dataset.id}" data-type="${type}">${value}</a>`;
      
      let path = this.normalizePath(`/dataset/${dataset.id}`);
      let row = [
        `<a href="${path}">${dataset.acronym[0].value}</a>`,
        dataset.name[0].value
      ];

      if (micaConfig.isCollectedDatasetEnabled && micaConfig.isHarmonizedDatasetEnabled) {
        row.push(tr(type.toLowerCase()));
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
}

