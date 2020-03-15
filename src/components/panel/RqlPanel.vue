<template>
<div>
  <template v-if="Array.isArray(taxonomy)">
  <div v-for="sub in taxonony" v-bind:key="sub.name">
    <rql-panel v-bind:target="target" v-bind:taxonomy="sub" v-bind:query="query"></rql-panel>
  </div>
  </template>

  <template v-else>
  <div class="input-group mb-4">
    <input type="text" class="form-control" v-model="panelFilter">
    <div class="input-group-append">
      <span class="input-group-text">Filter</span>
    </div>
  </div>
  <div class="card mb-2" v-for="vocabulary in vocabularies" v-bind:key="vocabulary.name">
    <div class="card-header">
      <span>{{ vocabulary.name }}</span>
      <span class="float-right">
        <button type="button" class="btn btn-link btn-sm" v-if="canDoSelectAll(vocabulary)" v-on:click="selectAll(vocabulary)"><span aria-hidden="true">Select All</span></button>
        <button type="button" class="btn btn-link btn-sm" v-if="hasAssociatedQuery(vocabulary)" v-on:click="clear(vocabulary)"><span aria-hidden="true">Clear</span></button>
      </span>      
    </div>
    <div class="card-body">
      <rql-panel-vocabulary v-bind:vocabulary="vocabulary" v-bind:query="getAssociatedQuery(vocabulary)" v-on:update-query="updateQuery"></rql-panel-vocabulary>
    </div>    
  </div>
  </template>

</div>  
</template>

<script>
import RqlPanelVocabulary from "./RqlPanelVocabulary.vue";
import Criterion from "../../libs/Criterion";

export default {
  name: "rql-panel",
  props: {
    target: {
      type: String,
      required: true
    },
    query: Object,
    taxonomy: [Object, Array]    
  },
  components: {
    RqlPanelVocabulary
  },
  data() {
    return {
      panelFilter: ""
    };
  },
  computed: {
    inputs() {
      return Criterion.splitQuery(this.query);
    },
    vocabularies() {
      if (!this.taxonomy) return [];      

      return (this.taxonomy.vocabularies || [])
      .filter(vocabulary => {
        return (!this.panelFilter || this.panelFilter.trim().length === 0) || vocabulary.name.toLowerCase().indexOf(this.panelFilter.toLowerCase()) > -1;
      });
    }
  },
  methods: {
    getAssociatedQuery(vocabulary) {
      if (this.query) {
        return Criterion.associatedQuery(vocabulary, this.inputs);      
      }

      return undefined;
    },
    hasAssociatedQuery(vocabulary) {
      return this.getAssociatedQuery(vocabulary) && true;
    },
    canDoSelectAll(vocabulary) {
      let type = Criterion.typeOfVocabulary(vocabulary);
      if (type === "TERMS") {
        let query = this.getAssociatedQuery(vocabulary);
        if (query) {
          return vocabulary.terms.length > query.args[1].length;
        }
        
        return true;
      }

      return false;
    },
    selectAll(payload) {
      let criterion = new Criterion(payload);
      criterion.query = {operator: "exists"};
      this.updateQuery(criterion);
    },
    clear(payload) {
      let criterion = new Criterion(payload);
      let input = this.getAssociatedQuery(payload);

      if (input) {
        criterion.query = input;
        this.removeQuery(criterion);
      }       
    },
    updateQuery(payload) {
      if (["missing", "exists"].indexOf(payload.operator) === -1 && (!Array.isArray(payload.value) || payload.value.length === 0)) {
        this.$emit("remove-query", {target: this.target, query: payload.asQuery(this.taxonomy.name)});
      } else {
        this.$emit("update-query", {target: this.target, query: payload.asQuery(this.taxonomy.name)});
      }
    },
    removeQuery(payload) { 
      this.$emit("remove-query", {target: this.target, query: payload.asQuery(this.taxonomy.name)});
    }
  }
}
</script>