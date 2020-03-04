<template>
<div>
  <span class="badge badge-primary">{{ taxonomyName }}</span>
  <ul class="list-inline">
    <li class="list-inline-item" v-for="criterion in criteria" v-bind:key="criterion.name">
      <rql-query v-bind:vocabulary="criterion.vocabulary" v-bind:operator="criterion.operator" v-bind:args="criterion.args" v-on:update-query="updateQuery" v-on:remove-query="removeQuery"></rql-query>
    </li>
  </ul>
</div>    
</template>

<script>
import RqlQuery from "./RqlQuery.vue";

function getVocabulary(taxonomy, operatorName, args) {
  if (!taxonomy) return null;
  let name = operatorName === "match" ? args[1] : args[0];

  let parts = name.split(".");
  if (parts.length === 2) {
    let vocabularyName = parts[1];
    return (taxonomy.vocabularies || []).filter(vocabulary => vocabulary.name === vocabularyName)[0];
  }

  return null;
}

export default {
  props: {
    query: Object,
    taxonomy: Object
  },
  computed: {
    taxonomyName() {
      if (this.taxonomy) {
        return this.taxonomy.name;
      }

      return "";
    },
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
      payload.target = this.taxonomy.name;
      this.$emit("update-query", payload);
    },
    removeQuery(payload) {
      payload.target = this.taxonomy.name;
      this.$emit("remove-query", payload);
    }
  }
}
</script>