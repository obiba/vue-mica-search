import Vue from 'vue';
import marked from 'marked';

export default class VariablesResultParser {

  constructor(normalizePath) {
    this.normalizePath = normalizePath;
  }

  parse(data, micaConfig, localize, displayOptions) {
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

      let path = this.normalizePath(`/variable/${summary.id}`);
      let row = ['<i class="far fa-square"></i>', summary.id, `<a href="${path}">${summary.name}</a>`,];

      displayOptions.variableColumns.forEach(column => {
        switch (column) {
          case 'label':
          case 'label+description': {
            let labelElem = marked(localize(summary.variableLabel));
            if (column === 'label+description' && summary.description) {
              labelElem =  "<i class='fa fa-info-circle text-muted float-left mr-2 mt-1' data-toggle='tooltip' data-html='true' title='" + marked(localize(summary.description)) + "'></i> " + labelElem;
            }
            row.push(labelElem);
            break;
          }
          case 'valueType': {
            row.push(tr(summary.valueType + '-type'));
            break;
          }
          case 'annotations': {
            const annotations = (summary.annotations || []).reduce(
              (acc, annotation) =>
                ("" !== acc ? `${acc}<br>` : "") + "<span class='small'><i class='fa fa-tag text-muted'></i> " +
                taxonomyTitle.apply(null, [`${annotation.taxonomy}.${annotation.vocabulary}.${annotation.value}`]) + "</span>",
              ""
            );
            row.push(annotations);
            break;
          }
          case 'type': {
            if (micaConfig.isCollectedDatasetEnabled && micaConfig.isHarmonizedDatasetEnabled) {
              row.push(tr(summary.variableType.toLowerCase()));
            }
            break;
          }
          case 'study': {
            if (!micaConfig.isSingleStudyEnabled) {
              path = this.normalizePath(`/study/${summary.studyId}`);
              row.push(`<a href="${path}">${localize(summary.studyAcronym)}</a>`);
            }
            break;
          }
          case 'dataset': {
            path = this.normalizePath(`/dataset/${summary.datasetId}`);  
            row.push(`<a href="${path}">${localize(summary.datasetAcronym)}</a>`);
            break;
          }
          default:
            console.debug('Wrong variable table column: ' + column);
        }
      });

      parsed.data.push(row);
    });

    return parsed;
  }
}

