<template>
<div v-bind:class="target" class="d-flex">
  <span class="my-auto text-muted" v-show="items.length > 0">
    <h4 class="mb-0"><i class="align-middle io" v-bind:class="targetIcon"></i></h4>
  </span>
  
  <rql-node v-for="(arg, index) in query.args" v-bind:key="index" v-bind:name="arg.name" v-bind:args="arg.args" v-bind:taxonomy="taxonomy" v-bind:advanced-mode="advancedMode" v-on:update-node="updateNode($event)" v-on:update-query="updateNodeQuery($event)" v-on:remove-query="removeNodeQuery($event)"></rql-node>
</div>    
</template>

<script>
import RqlNode from "./RqlNode.vue";
import Criterion from "../../libs/Criterion";

export default {
  name: "rql-query-builder",
  props: {
    advancedMode: {
      type: Boolean,
      default: false
    },
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
    items() {
      if (!this.taxonomy || !this.query) return [];

      let result = [];

      if (Array.isArray(this.taxonomy)) {
        this.taxonomy.forEach((t) => {
          let found = (t.vocabularies || []).filter(vocabulary => this.hasAssociatedQuery(vocabulary));
          result = result.concat(found);  
        });
      } else {
        result = (this.taxonomy.vocabularies || []).filter(vocabulary => this.hasAssociatedQuery(vocabulary));
      }

      return result.map(vocabulary => {
        let associatedQuery = this.getAssociatedQuery(vocabulary);
        return {name: vocabulary.name, taxonomyName: this.getAssociatedTaxonomyName(vocabulary), vocabulary, associatedQuery};
      });
    },
    targetIcon() {
      return "io-" + this.target;
    }
  },
  components: {
    RqlNode
  },
  methods: {
    getAssociatedTaxonomyName(test) {
      return Criterion.associatedTaxonomyName(this.taxonomy, test);
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
      const query = payload.asQuery(taxonomyName);

      if ((["missing", "exists"].indexOf(payload.operator) === -1 && payload.value.length === 0) || (payload.type === "NUMERIC" && query.args[1].length === 0)) {
        this.$emit("remove-query", {target: this.target, query});
      } else {
        this.$emit("update-query", {target: this.target, query});
      }      
    },
    removeQuery(payload, taxonomyName) {
      this.$emit("remove-query", {target: this.target, query: payload.asQuery(taxonomyName)});
    },
    updateNodeQuery(payload) {
      this.updateQuery(payload.data, payload.taxonomyName);
    },
    removeNodeQuery(payload) {
      this.removeQuery(payload.data, payload.taxonomyName);
    },
    updateNode(payload) {
      this.$emit("update-node", {query: payload.query, newName: payload.newName, target: this.target});
    }
  }
}
</script>