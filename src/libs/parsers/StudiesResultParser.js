import Vue from 'vue';
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

  parse(data, micaConfig) {
    const studiesResult = data.studyResultDto;
    
    if (!studiesResult) {
      throw new Error("No network results available.");
    }

    if (studiesResult.totalHits < 1) return { totalHits: 0 };

    const result = studiesResult["obiba.mica.StudyResultDto.result"];

    if (!result) {
      throw new Error("Invalid JSON.");
    }

    let parsed = {
      data: [],
      totalHits: studiesResult.totalHits
    }

    const taxonomyFilter = Vue.filter('taxonomy-title') || (title => title);
    const checkIcon = `<i class="fa fa-check">`;

    result.summaries.forEach(summary => {
      const type = summary.studyResourcePath === 'harmonization-study'
        ? taxonomyFilter.apply(null, ['Mica_study.className.HarmonizationStudy'])
        : taxonomyFilter.apply(null, ['Mica_study.className.Study']) ;

      const stats = summary['obiba.mica.CountStatsDto.studyCountStats'] || {};
      const content = JSON.parse(summary.content);
      const dataSources = summary.dataSources || [];
      const hasDatasource = (dataSources, id) => dataSources.indexOf(id) > -1;
      const design = summary.design ? taxonomyFilter.apply(null, [`Mica_study.methods-design.${summary.design}`]) : '-';
      let anchor = (type, value, studyType) =>
        `<a href="" class="query-anchor" data-study-type="${studyType}" data-target="study" data-target-id="${summary.id}" data-type="${type}">${value}</a>`;
      
      let row = [
        `<a href="/study/${summary.id}">${summary.acronym[0].value}</a>`,
        summary.name[0].value,
        type,
        design,
        hasDatasource(dataSources, "questionnaires") ? checkIcon : "-",
        hasDatasource(dataSources, "physical_measures") ? checkIcon : "-",
        hasDatasource(dataSources, "biological_samples") ? checkIcon : "-",
        hasDatasource(dataSources, "others") ? checkIcon : "-",
        this.__getNumberOfParticipants(content),
      ];

      if (micaConfig.isNetworkEnabled && !micaConfig.isSingleNetworkEnabled) {
        row.push(stats.networks ? anchor("networks", stats.networks, "") : "-");
      }

      if (micaConfig.isCollectedDatasetEnabled) {
        row.push(stats.studyDatasets
          ? anchor("datasets", stats.studyDatasets, "Study")
          : "-");
        row.push(stats.studyVariables
          ? anchor("variables", stats.studyVariables, "Study")
          : "-");
      }

      if (micaConfig.isHarmonizedDatasetEnabled) {
        row.push(stats.harmonizationDatasets
          ? anchor("datasets", stats.harmonizationDatasets, "HarmonizationStudy")
          : "-");
        row.push(stats.dataschemaVariables
          ? anchor("variables", stats.dataschemaVariables, "HarmonizationStudy")
          : "-");
      }

      parsed.data.push(row);
    });

    return parsed;
  }
}

