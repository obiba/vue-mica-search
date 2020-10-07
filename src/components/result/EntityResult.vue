<script>
import DataTable from "datatables.net-dt"; // eslint-disable-line no-unused-vars

export default {
  data() {
    return {
      dataTable: null,
      ajaxCallback: null,
      type: null,
      target: null,
      showResult: false,
      loading: true
    };
  },
  computed: {
    withNetworks: function() {
      return this.getMicaConfig().isNetworkEnabled && !this.getMicaConfig().isSingleNetworkEnabled;
    },
    withStudies: function() {
      return !this.getMicaConfig().isSingleStudyEnabled
    },
    withCollectedDatasets: function() {
      return this.getMicaConfig().isCollectedDatasetEnabled;
    },
    withHarmonizedDatasets: function() {
      return this.getMicaConfig().isHarmonizedDatasetEnabled;
    },
    // table headers
    variableColumnNames: function() {
      return this.getDisplayOptions().variableColumns
        .filter(col => {
          if (col === 'type') {
            return this.withCollectedDatasets && this.withHarmonizedDatasets;
          } else if (col === 'study') {
            return this.withStudies;
          }
          return true;
        })
        .map(col => col === 'label+description' ? 'label' : col);
    },
    // dataset headers
    datasetColumnNames: function() {
      return this.getDisplayOptions().datasetColumns
        .filter(col => {
          if (col === 'type') {
            return this.withCollectedDatasets && this.withHarmonizedDatasets;
          } else if (col === 'networks') {
            return this.withNetworks;
          } else if (col === 'studies') {
            return this.withStudies;
          }
          return true;
        });
    },
    // study headers, 1st row
    studyColumnItems: function() {
      return this.getDisplayOptions().studyColumns
        .filter(col => {
          if (col === 'type') {
            return this.withCollectedDatasets && this.withHarmonizedDatasets;
          } else if (col === 'networks') {
            return this.withNetworks;
          } else if (col === 'individual') {
            return this.withCollectedDatasets;
          } else if (col === 'harmonization') {
            return this.withHarmonizedDatasets;
          }
          return true;
        })
        .map(col => {
          return {
            name: col,
            rowspan: (['name', 'type', 'study-design', 'participants', 'networks'].includes(col) ? 2 : 1), 
            colspan: (['name', 'type', 'study-design', 'participants', 'networks'].includes(col) ? 1 : (col === 'data-sources-available' ? 4 : 2))
          }
        });
    },
    // study headers, 2nd row
    studyColumnItems2: function() {
      const items2 = [];
      this.getDisplayOptions().studyColumns
        .filter(col => {
          if (col === 'individual') {
            return this.withCollectedDatasets;
          } else if (col === 'harmonization') {
            return this.withHarmonizedDatasets;
          }
          return col === 'data-sources-available';
        })
        .forEach((col, id) => {
          if (['individual', 'harmonization'].includes(col)) {
            items2.push({id: id, name: 'datasets', title: ''});
            items2.push({id: id, name: 'variables', title: ''});  
          } else if (col === 'data-sources-available') {
            items2.push({
              id: id,
              title: 'Mica_study.populations-dataCollectionEvents-dataSources.questionnaires',
              icon: 'fa fa-file-alt'
              });
            items2.push({
              id: id,
              title: 'Mica_study.populations-dataCollectionEvents-dataSources.physical_measures',
              icon: 'fa fa-stethoscope'
              });
            items2.push({
              id: id,
              title: 'Mica_study.populations-dataCollectionEvents-dataSources.biological_samples',
              icon: 'fa fa-flask'
              });
            items2.push({
              id: id,
              title: 'Mica_study.populations-dataCollectionEvents-dataSources.others',
              icon: 'far fa-plus-square'
              });
          }
        });
      return items2;
    },
    // network headers, 1st row
    networkColumnItems: function() {
      return this.getDisplayOptions().networkColumns
        .filter(col => {
          if (col === 'type') {
            return this.withCollectedDatasets && this.withHarmonizedDatasets;
          } else if (col === 'studies') {
            return this.withStudies;
          } else if (col === 'datasets') {
            return this.withCollectedDatasets || this.withHarmonizedDatasets;
          } else if (col === 'variables') {
            return this.withCollectedDatasets || this.withHarmonizedDatasets;
          }
          return true;
        })
        .map(col => {
          return {
            name: col,
            rowspan: (['name', 'studies'].includes(col) ? 2 : 1), 
            colspan: (['name', 'studies'].includes(col) ? 1 : 2)
          }
        });
    },
    // network headers, 2nd row
    networkColumnItems2: function() {
      const items2 = [];
      this.getDisplayOptions().networkColumns
        .filter(col => {
          if (col === 'datasets') {
            return this.withCollectedDatasets || this.withHarmonizedDatasets;
          } else if (col === 'variables') {
            return this.withCollectedDatasets || this.withHarmonizedDatasets;
          }
          return false;
        })
        .forEach(col => {
          if (col === 'datasets') {
            items2.push({ name: 'collected'});
            items2.push({ name: 'harmonized'});  
          } else if (col === 'variables') {
            items2.push({ name: 'collected'});
            items2.push({ name: 'harmonized'});
          }
        });
      return items2;
    }
  },
  methods: {
    /**
     * Callback invoked when request response arrives
     */
    onResults(payload) {
      if (!this.dataTable) return;
      const pageInfo = this.dataTable.page.info();
      var parsed = this.parser.parse(payload.response, this.getMicaConfig(), this.localize, this.getDisplayOptions());
      this.showResult = parsed.totalHits > 0;
      this.loading = false;
      if (!this.showResult) return; 

      this.ajaxCallback({
        data: parsed.data,
        recordsTotal: parsed.totalHits,
        recordsFiltered: parsed.totalHits
      });

      const start = payload.hasOwnProperty("from") ? payload.from : null;
      if (start !== null && pageInfo.start !== start) {
        // The start has come from the query and not from pagination
        this.manualPagination = true;
        this.dataTable.page(start / pageInfo.length).draw(false);
        this.ajaxCallback({
          data: parsed.data,
          recordsTotal: parsed.totalHits,
          recordsFiltered: parsed.totalHits
        });
      }
    },
    /**
     * DataTable AJAX callback used to send pagination events 
     */
    onAjaxCallback(data, callback) {
      this.loading = true;
      if (this.ajaxCallback) {
        // this is called when paginating or page size is changed
        if (this.manualPagination) {
          this.manualPagination = false;
        } else {
          this.getEventBus().$emit("query-type-paginate", {
            display: "list",
            type: `${this.type}`,
            target: `${this.target}`,
            from: data.start,
            size: data.length
          });
        }
      } else {
        // first time table is registered
        this.ajaxCallback = callback;
      }
    },
    /**
     * Registers the DataTable
     */
    registerTable() {
      this.dataTable = this.registerDataTable(`vosr-${this.type}-result`, {
        processing: true,
        serverSide: true,
        ajax: this.onAjaxCallback.bind(this),
        fixedHeader: true
      });
    }
  },
  mounted() {
    console.debug(`${this.type} result table mounted...`);
    this.getEventBus().register(`${this.type}-results`,this.onResults.bind(this));
  },
  beforeDestroy() {
    this.dataTable = null;
    this.getEventBus().unregister(`${this.type}-results`, this.onResults);
  }
};
</script>
