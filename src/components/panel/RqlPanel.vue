<template>
<div>
  <template v-if="!hasExternalFilter">
  <div class="input-group mb-4">
    <input type="text" class="form-control" :placeholder="'search.filter-help' | translate" v-model="panelFilter">
    <div class="input-group-append">
      <span class="input-group-text">{{ "search.filter" | translate }}</span>
    </div>
  </div>
  </template>

  <template v-if="Array.isArray(taxonomy)">
  <div v-for="sub in taxonomy" v-bind:key="sub.name">
    <rql-panel v-bind:target="target" v-bind:taxonomy="sub" v-bind:query="query" v-on:update-query="updateQuery" v-on:remove-query="removeQuery" v-bind:external-filter="theFilter" v-bind:has-external-filter="true"></rql-panel>
  </div>
  </template>

  <template v-else>
  <h4 class="mt-3 panel-taxonomy-title" v-if="vocabularies.length > 0" v-bind:title="taxonomy.description | localize-string">
    {{ taxonomy.title | localize-string }}
  </h4>

  <p class="text-muted panel-taxonomy-description" v-if="vocabularies.length > 0">{{ taxonomy.description | localize-string }}</p>

  <div class="row d-flex align-items-stretch">
    <div class="col-12 col-sm-12 col-md-6 d-flex align-items-stretch" v-for="vocabulary in vocabularies" v-bind:key="vocabulary.name">
      <div class="card mb-2 w-100">
        <div class="card-header bg-light">
          <span class="panel-vocabulary-title" v-bind:title="vocabulary.description | localize-string">{{ vocabulary.title | localize-string }}</span>
          <span class="float-right">
            <button type="button" v-bind:id="vocabulary.name + '-select-all'" class="btn btn-link btn-sm pt-0 pb-0" v-if="canDoSelectAll(vocabulary)" v-on:click="selectAll(vocabulary)"><span aria-hidden="true">{{ "select-all" | translate }}</span></button>
            <button type="button" v-bind:id="vocabulary.name + '-clear-selection'" class="btn btn-link btn-sm pt-0 pb-0" v-if="hasAssociatedQuery(vocabulary)" v-on:click="clear(vocabulary)"><span aria-hidden="true">{{ "clear-selection" | translate }}</span></button>
          </span>      
        </div>
        <div class="card-body">
          <div v-if="vocabulary.description" class="panel-vocabulary-description text-muted mb-4">
            {{ vocabulary.description | localize-string }}
          </div>
          <rql-panel-vocabulary v-bind:vocabulary="vocabulary" v-bind:query="getAssociatedQuery(vocabulary)" v-bind:termsFilter="theFilter" v-on:update-query="updateQuery"></rql-panel-vocabulary>
        </div>    
      </div>
    </div>
  </div>

  </template>

</div>  
</template>

<script>
import RqlPanelVocabulary from "./RqlPanelVocabulary.vue";
import Criterion from "../../libs/Criterion";

import Vue from "vue";

export default {
  name: "rql-panel",
  props: {
    target: {
      type: String,
      required: true
    },
    hasExternalFilter: Boolean,
    externalFilter: String,
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
      
      const localizeStringFunction = Vue.filter("localize-string") || ((val) => val[0].text);

      return (this.taxonomy.vocabularies || [])
      .filter(vocabulary => {
        let found = (vocabulary.attributes || []).filter(attribute => attribute.key === "hidden").map(attribute => attribute.value);
        return found.length === 0 || "true" !== found[0];
      })
      .filter(vocabulary => {
        let passes = (!this.theFilter || this.theFilter.trim().length === 0);
        let vocabularyPasses = passes || localizeStringFunction(vocabulary.title).toLowerCase().indexOf(this.theFilter.toLowerCase()) > -1;
        if ("TERMS" !== Criterion.typeOfVocabulary(vocabulary) && vocabularyPasses) return true;

        let foundTerms = (vocabulary.terms || []).filter(term => passes || term.name.toLowerCase().indexOf(this.theFilter.toLowerCase()) > -1 || localizeStringFunction(term.title).toLowerCase().indexOf(this.theFilter.toLowerCase()) > -1);
        return vocabularyPasses || foundTerms.length > 0;
      });
    },
    theFilter() {
      return this.hasExternalFilter ? this.externalFilter : this.panelFilter;
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
          return vocabulary.terms.length > (query.args[1] || 0).length;
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
      if (payload instanceof Criterion) {
        const query = payload.asQuery(this.taxonomy.name);

        if ((["missing", "exists"].indexOf(payload.operator) === -1 && payload.value.length === 0) || (payload.type === "NUMERIC" && query.args[1].length === 0)) {
          this.$emit("remove-query", {target: this.target, query});
        } else {
          this.$emit("update-query", {target: this.target, query});
        }
      } else {
        this.$emit("update-query", payload);
      }      
    },
    removeQuery(payload) { 
      if (payload instanceof Criterion) this.$emit("remove-query", {target: this.target, query: payload.asQuery(this.taxonomy.name)});
      else this.$emit("remove-query", payload);
    }
  }
}
</script>