<template>
<div>
  <span class="badge badge-primary" v-show="criteria.length > 0">{{ target }}</span>
  <ul class="list-inline">
    <li class="list-inline-item" v-for="criterion in criteria" v-bind:key="criterion.name">
      <rql-query v-bind:vocabulary="criterion.vocabulary" v-bind:operator="criterion.operator" v-bind:args="criterion.args" v-on:update-query="updateQuery" v-on:remove-query="removeQuery"></rql-query>
    </li>
  </ul>
</div>    
</template>

<style>
@import "../../assets/bootstrap-grid.css";
</style>

<script>
import RqlQuery from "./RqlQuery.vue";

function getVocabulary(taxonomy, operatorName, args) {
  if (!taxonomy) return null;

  let name = operatorName === "match" ? args[1] : args[0];
  let parts = name.split(".");

  let input = Array.isArray(taxonomy) ? taxonomy : [taxonomy];

  let result = null;
  input.forEach((taxo => {
    if (parts.length === 2) {
      let taxonomyName = parts[0];
      let vocabularyName = parts[1];
      let found = (taxo.vocabularies || []).filter(vocabulary => taxo.name === taxonomyName && vocabulary.name === vocabularyName)[0];

      if (found) result = found;
    } 
  }));

  return result;
}

export default {
  props: {
    target: {
      type: String,
      required: true
    },
    query: Object,
    taxonomy: [Object, Array]
  },
  computed: {
    criteria() {
      let result = [];

      if (this.query) {
        this.query.walk((name, args) => result.push({operator: name, vocabulary: getVocabulary(this.taxonomy, name, args), args}));
      }      

      return result.filter(r => r.vocabulary);
    }
  },
  components: {
    RqlQuery
  },
  methods: {
    updateQuery(payload) {
      payload.target = this.target;
      this.$emit("update-query", payload);
    },
    removeQuery(payload) {
      payload.target = this.target;
      this.$emit("remove-query", payload);
    }
  }
}
</script>