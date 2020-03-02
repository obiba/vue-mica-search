export default class StudiesResultParser {

  constructor() {
  }  

  __getNumberOfParticipants(content) {
     const numberOfParticipants = content['numberOfParticipants'];
     if (numberOfParticipants) {
      const participant = numberOfParticipants['participant'];
      if (participant) {
        return participant.number || '-';
      }
     }

     return '-';
  }

  parse(data) {
    const studiesResult = data.studyResultDto;

    if (!studiesResult) {
      throw new Error("No network results available.");
    }

    const result = studiesResult["obiba.mica.StudyResultDto.result"];

    if (!result) {
      throw new Error("Invalid JSON.");
    }

    let parsed = {
      data: [],
      totalHits: studiesResult.totalHits
    }

    result.summaries.forEach(summary => {
      const type = summary.variableType === 'Dataschema' ? 'Harmonized' : 'Collected';
      const stats = summary['obiba.mica.CountStatsDto.studyCountStats'] || {};
      const content = JSON.parse(summary.content);

      parsed.data.push(
        [
          `<a href="/study/${summary.id}">${summary.acronym[0].value}</a>`,
          summary.name[0].value,
          type,
          summary.design || '-',
          (summary.dataSources || []).join('<br>'),
          this.__getNumberOfParticipants(content),
          stats.networks || '-',
          stats.studyDatasets || '-',
          stats.studyVariables || '-',
          stats.harmonizationDatasets || '-',
          stats.dataschemaVariables || '-'
        ]
      );
    });

    return parsed;
  } 
}
