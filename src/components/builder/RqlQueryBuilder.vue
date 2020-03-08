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

<script>
import RqlQuery from "./RqlQuery.vue";
import Query from "rql/src/query";

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
      let args = [`${this.taxonomy.name}.${payload.vocabularyName}`];

      if (["missing", "exists"].indexOf(payload.value.operator) === -1 && (!Array.isArray(payload.value.args) || payload.value.args.length === 0)) {
        this.$emit("remove-query", new Query(payload.value.operator, args));
      } else {
        if ("match" === payload.value.operator) {
          args.unshift(payload.value.args);
        } else if (["missing", "exists"].indexOf(payload.value.operator) === -1) {
          args.push(payload.value.args);
        }

        this.$emit("update-query", {target: this.target, query: new Query(payload.value.operator, args)});
      }
    },
    removeQuery(payload) {
      let args = [`${this.taxonomy.name}.${payload.vocabularyName}`];    
      this.$emit("remove-query", {target: this.target, query: new Query(payload.value.operator, args)});
    }
  }
}
</script>