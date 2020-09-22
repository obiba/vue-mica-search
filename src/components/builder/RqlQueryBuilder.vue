<template>
<div>
  <span class="float-left mr-2 text-muted" v-show="items.length > 0">
    <h4><i class="align-middle io" v-bind:class="targetIcon"></i></h4>
  </span>
  
  <template v-if="!advancedMode">
  <ul class="list-inline">
    <li class="list-inline-item mb-2" v-for="item in items" v-bind:key="item.name">
      <rql-query v-bind:vocabulary="item.vocabulary" v-bind:query="item.associatedQuery" v-on:update-query="updateQuery($event, item.taxonomyName)" v-on:remove-query="removeQuery($event, item.taxonomyName)"></rql-query>
    </li>
  </ul>
  </template>

  <template v-else>
  <rql-node v-for="(arg, index) in query.args" v-bind:key="index" v-bind:name="arg.name" v-bind:args="arg.args" v-bind:taxonomy="taxonomy" v-on:update-node="updateNode($event)" v-on:update-query="updateNodeQuery($event)" v-on:remove-query="removeNodeQuery($event)"></rql-node>
  </template>
</div>    
</template>

<script>
import RqlQuery from "./RqlQuery.vue";
import RqlNode from "./RqlNode.vue";
import Criterion from "../../libs/Criterion";

export default {
  name: "rql-query-builder",
  props: {
    advancedMode: {
      type: Boolean,
      default: true
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
    RqlQuery,
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
      this.$emit("update-node", {payload, target: this.target});
    }
  }
}
</script>