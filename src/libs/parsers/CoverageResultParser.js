const BUCKET_TYPES = {
  STUDY: 'studyId',
  DCE: 'dceId',
  DATASET: 'datasetId',
}

class IdSplitter {
  constructor(bucket, result) {
    this.bucket = bucket;
    this.result = result;
    this.rowSpans = {};
    this.minMax = {};
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth() + 1;
    this.currentYearMonth = this.currentYear + '-' + this.currentMonth;    
    this.currentDate = this.__toTime(this.currentYearMonth, true);
  }

  __getBucketUrl(bucket, id) {
    switch (bucket) {
      case BUCKET_TYPES.STUDY:
      case BUCKET_TYPES.DCE:
        return `/study/${id}`;
      case BUCKET_TYPES.DATASET:
        return `/dataset/${id}`
    }

    return '';
  }

  __appendRowSpan(id) {
    let rowSpan;
    if (!this.rowSpans[id]) {
      rowSpan = 1;
      this.rowSpans[id] = 1;
    } else {
      rowSpan = 0;
      this.rowSpans[id] = this.rowSpans[id] + 1;
    }
    return rowSpan;
  }

  __appendMinMax(id, start, end) {
    if (this.minMax[id]) {
      if (start < this.minMax[id][0]) {
        this.minMax[id][0] = start;
      }
      if (end > this.minMax[id][1]) {
        this.minMax[id][1] = end;
      }
    } else {
      this.minMax[id] = [start, end];
    }
  }

  __toTime(yearMonth, start) {
    let res;
    if (yearMonth) {
      if (yearMonth.indexOf('-') > 0) {
        let ym = yearMonth.split('-');
        if (!start) {
          let m = parseInt(ym[1]);
          if (m < 12) {
            ym[1] = m + 1;
          } else {
            ym[0] = parseInt(ym[0]) + 1;
            ym[1] = 1;
          }
        }
        let ymStr = ym[0] + '/' + ym[1] + '/01';
        res = Date.parse(ymStr);
      } else {
        res = start ? Date.parse(yearMonth + '/01/01') : Date.parse(yearMonth + '/12/31');
      }
    }
    return res;
  }

  __getProgress(startYearMonth, endYearMonth) {
    let start = this.__toTime(startYearMonth, true);
    let end = endYearMonth ? this.__toTime(endYearMonth, false) : this.currentDate;
    let current = end < this.currentDate ? end : this.currentDate;
    if (end === start) {
      return 100;
    } else {
      return Math.round(startYearMonth ? 100 * (current - start) / (end - start) : 0);
    }
  }

  splitIds(micaConfig, locale) {

    let cols = {
      colSpan: this.bucket.startsWith('dce') ? (micaConfig.isSingleStudyEnabled ? 2 : 3) : 1,
      ids: {}
    };

    let odd = true;
    let groupId;
    
    this.result.rows.forEach((row, i) => {
      row.hitsTitles = row.hits.map(function (hit) {
        return hit.toLocaleString(locale);
      });
      cols.ids[row.value] = [];
      if (this.bucket.startsWith('dce')) {
        let ids = row.value.split(':');
        let isHarmo = row.className.indexOf('Harmonization') > -1 || ids[2] === '.'; // would work for both HarmonizationDataset and HarmonizationStudy
        let titles = row.title.split(':');
        let descriptions = row.description.split(':');
        let rowSpan;
        let id;

        // study
        id = ids[0];
        if (!groupId) {
          groupId = id;
        } else if (id !== groupId) {
          odd = !odd;
          groupId = id;
        }
        rowSpan = this.__appendRowSpan(id);
        this.__appendMinMax(id, row.start || this.currentYearMonth, row.end || this.currentYearMonth);
        const studyUrl = this.__getBucketUrl(this.bucket, id);
        
        cols.ids[row.value].push({
          id: id,
          url: studyUrl,
          title: titles[0],
          description: descriptions[0],
          rowSpan: rowSpan,
          index: i++
        });

        // population
        id = ids[0] + ':' + ids[1];
        rowSpan = this.__appendRowSpan(id);
        cols.ids[row.value].push({
          id: id,
          url: studyUrl,
          title: titles[1],
          description: descriptions[1],
          rowSpan: rowSpan,
          index: i++
        });

        // dce
        cols.ids[row.value].push({
          id: isHarmo ? '-' : row.value,
          title: titles[2],
          description: descriptions[2],
          start: row.start,
          current: this.currentYearMonth,
          end: row.end,
          progressClass: odd ? 'info' : 'warning',
          url: studyUrl,
          rowSpan: 1,
          index: i++
        });
      } else {       
        cols.ids[row.value].push({
          id: row.value,
          url: this.__getBucketUrl(this.bucket, row.value),
          title: row.title,
          description: row.description,
          min: row.start,
          start: row.start,
          current: this.currentYear,
          end: row.end,
          max: row.end,
          progressStart: 0,
          progress: this.__getProgress(row.start ? row.start + '-01' : this.currentYearMonth, row.end ? row.end + '-12' : this.currentYearMonth),
          progressClass: odd ? 'info' : 'warning',
          rowSpan: 1,
          index: i++
        });
        odd = !odd;
      }
    });

    // adjust the rowspans and the progress
    if (this.bucket.startsWith('dce')) {
      this.result.rows.forEach((row, i) => {
        row.hitsTitles = row.hits.map(function (hit) {
          return hit.toLocaleString(locale);
        });
        if (cols.ids[row.value][0].rowSpan > 0) {
          cols.ids[row.value][0].rowSpan = this.rowSpans[cols.ids[row.value][0].id];
        }
        if (cols.ids[row.value][1].rowSpan > 0) {
          cols.ids[row.value][1].rowSpan = this.rowSpans[cols.ids[row.value][1].id];
        }
        let ids = row.value.split(':');
        if (this.minMax[ids[0]]) {
          let min = this.minMax[ids[0]][0];
          let max = this.minMax[ids[0]][1];
          let start = cols.ids[row.value][2].start || this.currentYearMonth;
          let end = cols.ids[row.value][2].end || this.currentYearMonth;
          let diff = this.__toTime(max, false) - this.__toTime(min, true);
          // set the DCE min and max dates of the study
          cols.ids[row.value][2].min = min;
          cols.ids[row.value][2].max = max;
          // compute the progress
          cols.ids[row.value][2].progressStart = 100 * (this.__toTime(start, true) - this.__toTime(min, true)) / diff;
          cols.ids[row.value][2].progress = 100 * (this.__toTime(end, false) - this.__toTime(start, true)) / diff;
          cols.ids[row.value].index = i;
        }
      });
    }

    return cols;
  }  

}


export default class CoverageResultParser {

  constructor(micaConfig, locale) {
    this.micaConfig = micaConfig;
    this.locale = locale;
  }

  decorateVocabularyHeaders(headers, vocabularyHeaders) {
    let count = 0, i = 0;
    for (let j = 0; j < vocabularyHeaders.length; j++) {
      if (count >= headers[i].termsCount) {
        i++;
        count = 0;
      }

      count += vocabularyHeaders[j].termsCount;
      vocabularyHeaders[j].taxonomyName = headers[i].entity.name;
    }
  }

  decorateTermHeaders(headers, termHeaders, attr) {
    let idx = 0;
    return headers.reduce(function (result, h) {
      result[h.entity.name] = termHeaders.slice(idx, idx + h.termsCount).map(function (t) {
        if (h.termsCount > 1 && attr === 'vocabularyName') {
          t.canRemove = true;
        }

        t[attr] = h.entity.name;

        return t;
      });

      idx += h.termsCount;
      return result;
    }, {});
  }

  parseHeaders(bucket, result) {
    let table = { cols: [] };
    let vocabulariesTermsMap = {};

    if (result && result.rows) {
      var tableTmp = result;
      tableTmp.cols = new IdSplitter(bucket, result).splitIds(this.micaConfig, this, this.locale);
      table = tableTmp;

      // TODO let filteredRows = [];
      // TODO let nextFilteredRowsPage = 0;
      // TODO $scope.loadMoreRows();

      vocabulariesTermsMap = this.decorateTermHeaders(table.vocabularyHeaders, table.termHeaders, 'vocabularyName');
      this.decorateTermHeaders(table.taxonomyHeaders, table.termHeaders, 'taxonomyName');
      this.decorateVocabularyHeaders(table.taxonomyHeaders, table.vocabularyHeaders);
      // TODO $scope.isFullCoverageImpossibleOrCoverageAlreadyFull();
    }

    return { table, vocabulariesTermsMap};
  }

  parse(data) {    
    return data;
  }
}