export default class VariablesResultParser {

  constructor() {
  }  

  parse(data) {
    const variablesResult = data.variableResultDto;

    if (!variablesResult) {
      throw new Error("No variable results available.");
    }

    const result = variablesResult["obiba.mica.DatasetVariableResultDto.result"];

    if (!result) {
      throw new Error("Invalid JSON.");
    }

    let parsed = {
      data: [],
      totalHits: variablesResult.totalHits
    }

    result.summaries.forEach(summary => {
      parsed.data.push(
        [
          `<a href="/variable/${summary.id}">${summary.name}</a>`,
          summary.variableLabel[0].value,
          summary.annotations.reduce((acc, annotation) => 
            ('' !== acc ? `${acc}\n` : '') + `${annotation.taxonomy}.${annotation.vocabulary}.${annotation.value}`
          , ''),
          summary.variableType,
          summary.studyAcronym[0].value,
          summary.datasetAcronym[0].value
        ]
      );
    });

    return parsed;
  } 
}

