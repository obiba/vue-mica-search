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
      selections: []
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
    },
    clearSelections() {
      this.selections = [];
    },
    isSelected(id) {
      return this.selections && this.selections.includes(id)
    },
    onSelectionChanged(ids, selected) {
      if (selected) {
        if (Array.isArray(ids)) {
          ids.forEach(id => {
            if (!this.selections.includes(id)) {
              this.selections.push(id);
            }
          });
        }
      } else {
        if (Array.isArray(ids)) {
          ids.forEach(id => {
            const idx = this.selections.indexOf(id);
            if (idx > -1) {
              this.selections.splice(idx, 1);
            }
          });
        } else {
          this.selections = [];
        }
      }

      this.getEventBus().$emit(`${this.type}-selections-updated`, {selections: this.selections});
    }
  },
  mounted() {
    console.debug(`${this.type} result table mounted...`);
    this.getEventBus().register(`${this.type}-results`,this.onResults.bind(this));
    this.getEventBus().register("clear-results-selections", this.clearSelections.bind(this));
  },
  beforeDestroy() {
    this.dataTable = null;
    this.getEventBus().unregister(`${this.type}-results`, this.onResults);
    this.getEventBus().unregister("clear-results-selections", this.clearSelections);
  }
};
</script>
