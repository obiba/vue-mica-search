<template>
<div>
  <span class="badge badge-primary" v-show="Array.isArray(taxonomy) || vocabularies.length > 0">{{ target }}</span>

  <template v-if="Array.isArray(taxonomy)">
  <div v-for="sub in taxonony" v-bind:key="sub.name">
    <rql-query-builder v-bind:target="target" v-bind:taxonomy="sub" v-bind:query="query"></rql-query-builder>
  </div>
  </template>

  <template v-else>
  <ul class="list-inline">
    <li class="list-inline-item" v-for="vocabulary in vocabularies" v-bind:key="vocabulary.name">
      <rql-query v-bind:vocabulary="vocabulary" v-bind:query="getAssociatedQuery(vocabulary)" v-on:update-query="updateQuery" v-on:remove-query="removeQuery"></rql-query>
    </li>
  </ul>
  </template>
</div>    
</template>

<script>
import RqlQuery from "./RqlQuery.vue";
import Criterion from "../../libs/Criterion";

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
    inputs() {
      return Criterion.splitQuery(this.query);
    },
    vocabularies() {
      if (!this.taxonomy) return [];      

      return (this.taxonomy.vocabularies || [])
      .filter(vocabulary => {
        return this.hasAssociatedQuery(vocabulary);
      });
    }
  },
  components: {
    RqlQuery
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