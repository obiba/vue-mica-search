import Vue from 'vue';

export default class DatasetsResultParser {

  constructor(normalizePath) {
    this.normalizePath = normalizePath;
  }

  parse(data, micaConfig, localize, displayOptions) {
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

      let path = this.normalizePath(`/dataset/${dataset.id}`);
      let row = [`<a href="${path}">${localize(dataset.acronym)}</a>`];
      const type = dataset.variableType === 'Dataschema' 
        ? taxonomyFilter.apply(null, ['Mica_dataset.className.HarmonizationDataset'])
        : taxonomyFilter.apply(null, ['Mica_dataset.className.StudyDataset']) ;
      const stats = dataset['obiba.mica.CountStatsDto.datasetCountStats'] || {};
      let anchor = (type, value) => `<a href="" class="query-anchor" data-target="dataset" data-target-id="${dataset.id}" data-type="${type}">${value}</a>`;
  
      displayOptions.datasetColumns.forEach(column => {
        switch (column) {
          case 'name': {
            row.push(localize(dataset.name));
            break;
          }
          case 'type': {
            if (micaConfig.isCollectedDatasetEnabled && micaConfig.isHarmonizedDatasetEnabled) {
              row.push(tr(type.toLowerCase()));
            }
            break;
          }
          case 'networks': {
            if (micaConfig.isNetworkEnabled && !micaConfig.isSingleNetworkEnabled) {
              row.push(stats.networks ? anchor('networks', stats.networks) : '-');
            }
            break;
          }
          case 'studies': {
            if (!micaConfig.isSingleStudyEnabled) {
              row.push(stats.studies ? anchor('studies', stats.studies) : '-');
            }
            break;
          }
          case 'variables': {
            row.push(stats.variables ? anchor('variables', stats.variables) : '-');
            break;
          }
          default:
            row.push('');
            console.debug('Wrong dataset table column: ' + column);
        }
      });

      parsed.data.push(row);
    });

    return parsed;
  }
}

