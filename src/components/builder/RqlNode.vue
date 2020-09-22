<template>
<span>
  <ul class="list-inline">
    <li class="list-inline-item mb-2">
      <template v-if="isNode(firstArg)">
      <rql-node v-bind:name="firstArg.name" v-bind:args="firstArg.args" v-bind:taxonomy="taxonomy" v-on:update-node="onUpdateNode($event)" v-on:update-query="updateQuery($event, firstArg.taxonomyName)" v-on:remove-query="removeQuery($event, firstArg.taxonomyName)"></rql-node>
      </template>

      <template v-else>
      <rql-query v-bind:vocabulary="firstArg.vocabulary" v-bind:query="firstArg.associatedQuery" v-on:update-query="updateQuery($event, firstArg.taxonomyName)" v-on:remove-query="removeQuery($event, firstArg.taxonomyName)"></rql-query>
      </template>
    </li>

    <li class="list-inline-item mb-2">
      <div class="dropdown">
        <button type="button" class="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown">{{ "search." + name | translate }}</button>
        
        <div class="dropdown-menu">
          <a class="dropdown-item" href="#" v-if="name !== 'and'" v-on:click="updateNodeName('and')">{{ "search.and" | translate }}</a>
          <a class="dropdown-item" href="#" v-if="name !== 'or'" v-on:click="updateNodeName('or')">{{ "search.or" | translate }}</a>
        </div>
      </div>
    </li>

    <li v-for="(arg, index) in otherArgs" v-bind:key="index" class="list-inline-item mb-2">
      <template v-if="isNode(arg)">
      <rql-node v-bind:name="arg.name" v-bind:args="arg.args" v-bind:taxonomy="taxonomy" v-on:update-node="onUpdateNode($event)" v-on:update-query="updateQuery($event, arg.taxonomyName)" v-on:remove-query="removeQuery($event, arg.taxonomyName)"></rql-node>
      </template>

      <template v-else>
      <rql-query v-bind:vocabulary="arg.vocabulary" v-bind:query="arg.associatedQuery" v-on:update-query="updateQuery($event, arg.taxonomyName)" v-on:remove-query="removeQuery($event, arg.taxonomyName)"></rql-query>
      </template>
    </li>
  </ul>
</span>
</template>

<script>
import * as RQL from "rql";
import RqlQuery from "./RqlQuery.vue";
import Criterion from "../../libs/Criterion";

export default {
  name: "rql-node",
  props: {
    name: String,
    args: Array,
    taxonomy: [Object, Array]
  },
  computed: {
    firstArg() {
      if (this.isNode()) {
        const arg = this.args.slice(0, 1)[0];
        return this.isNode(arg) ? arg : this.asInput(arg);
      } else {
        const query = new RQL.Query(this.name);
        query.args = this.args;
        return this.asInput(query);
      }
    },
    otherArgs() {
      if (this.isNode()) {
        const others = this.args.slice(1);      
        return others.map(other => {
          if (this.isNode(other)) {
            return this.isNode(other) ? other : this.asInput(other);
          } else {
            return this.asInput(other);
          }
        });
      } else {
        return [];
      }  
    }
  },
  components: {
    RqlQuery
  },
  methods: {
    isNode(arg) {
      return Criterion.NODE_NAMES.indexOf(arg || this.name) > -1;
    },
    asInput(arg) {
      const vocabulary = Criterion.associatedVocabulary(this.taxonomy, arg);
      if (vocabulary) {
        const taxonomyName = Criterion.associatedTaxonomyName(this.taxonomy, vocabulary);
        return {name: vocabulary.name, taxonomyName, vocabulary, associatedQuery: arg};
      }

      return undefined;
    },
    updateQuery(payload, taxonomyName) {
      this.$emit("update-query", { data: payload, taxonomyName });
    },
    removeQuery(payload, taxonomyName) {
      this.$emit("remove-query", { data: payload, taxonomyName });
    },
    onUpdateNode(payload) {
      this.$emit("update-node", payload);
    },
    updateNodeName(nodeName) {
      const query = new RQL.Query(this.name);
      query.args = this.args;

      this.$emit("update-node", {newName: nodeName, query});
    }
  }
}
</script>