<template>
<div>
  <span class="badge badge-primary" v-show="vocabularies.length > 0">{{ target }}</span>  
  <ul class="list-inline">
    <li class="list-inline-item" v-for="vocabulary in vocabularies" v-bind:key="vocabulary.name">
      <rql-query v-bind:vocabulary="vocabulary" v-bind:query="getAssociatedQuery(vocabulary)" v-on:update-query="updateQuery($event, getAssociatedTaxonomyName(vocabulary))" v-on:remove-query="removeQuery($event, getAssociatedTaxonomyName(vocabulary))"></rql-query>
    </li>
  </ul>
</div>    
</template>

<script>
import RqlQuery from "./RqlQuery.vue";
import Criterion from "../../libs/Criterion";

export default {
  name: "rql-query-builder",
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
      if (Array.isArray(this.taxonomy)) {
        let result = [];
        this.taxonomy.forEach((t) => {
          let found = (t.vocabularies || [])
          .filter(vocabulary => {
            return this.hasAssociatedQuery(vocabulary);
          });

          result = result.concat(found);  
        });

        return result;
      } else {
        return (this.taxonomy.vocabularies || [])
          .filter(vocabulary => {
            return this.hasAssociatedQuery(vocabulary);
          });
      }
    }
  },
  components: {
    RqlQuery
  },
  methods: {
    getAssociatedTaxonomyName(test) {
      if (Array.isArray(this.taxonomy)) {
        let result = this.taxonomy.filter((t) => {
          let found = (t.vocabularies || [])
          .filter(vocabulary => {
            return vocabulary.name === test.name;
          });

          return found.length > 0;
        })[0];

        return result ? result.name : undefined;
      } else {
        return this.taxonomy.name;
      }
    },
    getAssociatedQuery(vocabulary) {
      if (this.query) {
        return Criterion.associatedQuery(vocabulary, this.inputs);       
      }

      return undefined;
    },
    hasAssociatedQuery(vocabulary) {
      return this.getAssociatedQuery(vocabulary) && true;
    },
    updateQuery(payload, taxonomyName) {
      if (["missing", "exists"].indexOf(payload.operator) === -1 && (!Array.isArray(payload.value) || payload.value.length === 0)) {
        this.$emit("remove-query", {target: this.target, query: payload.asQuery(taxonomyName)});
      } else {
        this.$emit("update-query", {target: this.target, query: payload.asQuery(taxonomyName)});
      }      
    },
    removeQuery(payload, taxonomyName) {
      this.$emit("remove-query", {target: this.target, query: payload.asQuery(taxonomyName)});
    }
  }
}
</script>