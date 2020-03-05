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
      const annotations = (summary.annotations || []).reduce(
        (acc, annotation) =>
          ("" !== acc ? `${acc}\n` : "") +
          `${annotation.taxonomy}.${annotation.vocabulary}.${annotation.value}`,
        ""
      );

      parsed.data.push([
        `<a href="/variable/${summary.id}">${summary.name}</a>`,
        summary.variableLabel[0].value,
        `${annotations}`,
        summary.variableType,
        `<a href="/study/${summary.studyId}">${summary.studyAcronym[0].value}</a>`,
        `<a href="/dataset/${summary.datasetId}">${summary.datasetAcronym[0].value}</a>`
      ]);
    });

    return parsed;
  } 
}

