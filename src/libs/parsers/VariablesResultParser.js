import $ from 'jquery';

export default class VariablesResultParser {

  constructor() {
  }  

  parse(data, micaConfig) {
    const variablesResult = data.variableResultDto;

    this.showHits(data);

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
          ("" !== acc ? `${acc}\n` : "") +
          `${annotation.taxonomy}.${annotation.vocabulary}.${annotation.value}`,
        ""
      );

      let row = [
        `<a href="/variable/${summary.id}">${summary.name}</a>`,
        summary.variableLabel[0].value,
        `${annotations}`
      ];

      if (micaConfig.isCollectedDatasetEnabled && micaConfig.isHarmonizedDatasetEnabled) {
        row.push(summary.variableType);
      }

      if (!micaConfig.isSingleStudyEnabled) {
        row.push(`<a href="/study/${summary.studyId}">${summary.studyAcronym[0].value}</a>`);
      }

      row.push(`<a href="/dataset/${summary.datasetId}">${summary.datasetAcronym[0].value}</a>`);

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

