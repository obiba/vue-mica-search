<template>
<div>
  <template v-if="Array.isArray(taxonomy)">
  <div v-for="sub in taxonony" v-bind:key="sub.name">
    <rql-panel v-bind:taxonomy="sub" v-bind:query="query"></rql-panel>
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
        <button type="button" class="btn btn-link btn-sm" v-if="vocabulary.allSelectableTerms" v-on:click="updateQuery({vocabularyName: vocabulary.name, target: taxonomy.name, value: {operator: 'exists', terms: []}})"><span aria-hidden="true">Select All</span></button>
        <button type="button" class="btn btn-link btn-sm" v-if="vocabulary.associatedQuery" v-on:click="removeQuery({vocabularyName: vocabulary.name, target: taxonomy.name})"><span aria-hidden="true">Clear</span></button>
      </span>      
    </div>
    <div class="card-body">
      <rql-panel-vocabulary v-bind:vocabulary="vocabulary" v-on:update-query="updateQuery"></rql-panel-vocabulary>
    </div>    
  </div>
  </template>

</div>  
</template>

<script>
import RqlPanelVocabulary from "./RqlPanelVocabulary.vue";

function criterionIsForVocabulary(criterion, vocabulary) {
  let name = criterion.operator === "match" ? criterion.args[1] : criterion.args[0];
  let parts = name.split(".");
  if (parts.length === 2) {
    let vocabularyName = parts[1];
    return vocabularyName === vocabulary.name;
  }

  return false;
}

export default {
  name: "rql-panel",
  props: {
    taxonomy: Object,
    query: Object
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
    vocabularies() {
      let criteria = [];
      this.query.walk((name, args) => criteria.push({operator: name, args}));

      return (this.taxonomy.vocabularies || [])
      .map(vocabulary => {
        let found = criteria.filter(criterion => criterionIsForVocabulary(criterion, vocabulary))[0];
        vocabulary.associatedQuery = found;

        if (found && Array.isArray(vocabulary.terms) && vocabulary.terms.length > 0 && ["exists", "missing"].indexOf(found.operator) === -1) {
          vocabulary.allSelectableTerms = vocabulary.terms.length > (Array.isArray(found.args[1]) ? found.args[1] : [found.args[1]]).length;
        }

        return vocabulary;
      })      
      .filter(vocabulary => {
        return (!this.panelFilter || this.panelFilter.trim().length === 0) || vocabulary.name.toLowerCase().indexOf(this.panelFilter.toLowerCase()) > -1;
      });
    }
  },
  methods: {
    updateQuery(payload) {
      payload.target = this.taxonomy.name;
      this.$emit("update-query", payload);
    },
    removeQuery(payload) {      
      this.$emit("remove-query", payload);
    }
  }
}
</script>