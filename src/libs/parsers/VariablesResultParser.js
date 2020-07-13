import Vue from 'vue';

export default class VariablesResultParser {

  constructor(normalizePath) {
    this.normalizePath = normalizePath;
  }

  parse(data, micaConfig) {
    const variablesResult = data.variableResultDto;
    const tr = Vue.filter('translate') || (value => value);
    const taxonomyTitle = Vue.filter('taxonomy-title') || (value => value);

    if (!variablesResult) {
      throw new Error("No variable results available.");
    }

    if (variablesResult.totalHits < 1) return { totalHits: 0 };

    const result = variablesResult["obiba.mica.DatasetVariableResultDto.result"];

    if (!result) {
      throw new Error("Invalid JSON.");
    }

    let parsed = {
      data: [],
      totalHits: variablesResult.totalHits
    }

    result.summaries.forEach(summary => {
      const annotations = (summary.annotations || []).reduce(
        (acc, annotation) =>
          ("" !== acc ? `${acc}<br>` : "") +
          taxonomyTitle.apply(null, [`${annotation.taxonomy}.${annotation.vocabulary}.${annotation.value}`]),
        ""
      );

      let path = this.normalizePath(`/variable/${summary.id}`);
      let row = [
        `<a href="${path}">${summary.name}</a>`,
        summary.variableLabel[0].value,
        `${annotations}`
      ];

      if (micaConfig.isCollectedDatasetEnabled && micaConfig.isHarmonizedDatasetEnabled) {
        row.push(tr(summary.variableType.toLowerCase()));
      }

      if (!micaConfig.isSingleStudyEnabled) {
        path = this.normalizePath(`/study/${summary.studyId}`);
        row.push(`<a href="${path}">${summary.studyAcronym[0].value}</a>`);
      }

      path = this.normalizePath(`/dataset/${summary.datasetId}`);  
      row.push(`<a href="${path}">${summary.datasetAcronym[0].value}</a>`);

      parsed.data.push(row);
    });

    return parsed;
  }
}

