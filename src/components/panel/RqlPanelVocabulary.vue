<template>
<div>
  <template v-if="criterion.type === 'TERMS'">

    <ul class="list-unstyled row">
      <li class="list-item col-sm-4" v-for="term in terms" v-bind:key="term.name" v-bind:title="term.description | localize-string">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-bind:id="vocabulary.name + '-' + term.name" v-bind:value="term.name" v-model="criterion.value" v-on:change="onInput()">
          <label class="form-check-label text-break" v-bind:for="vocabulary.name + '-' + term.name">{{ term.title | localize-string }}</label>
        </div>
      </li>
    </ul>

    <div v-if="showMoreLess()" class="float-right">
      <button type="button" class="btn btn-link btn-sm" v-on:click="switchMoreLess()">
        <span v-if="!showAll" aria-hidden="true"><i class="fas fa-caret-down"></i> {{ "more" | translate }}</span>
        <span v-if="showAll" aria-hidden="true"><i class="fas fa-caret-up"></i> {{ "less" | translate }}</span>
      </button>
    </div>

  </template>

  <template v-else-if="criterion.type === 'NUMERIC'">

    <div class="form-group col-6 d-inline-block">
      <label v-bind:for="vocabulary.name + 'from'">{{ "search.from" | translate }}</label>
      <input type="number" class="form-control" v-bind:id="vocabulary.name + '-from'" v-model="criterion.value[0]" v-on:change="onInput()">
    </div>
    <div class="form-group col-6 d-inline-block">
      <label v-bind:for="vocabulary.name + 'to'">{{ "search.to" | translate }}</label>
      <input type="number" class="form-control" v-bind:id="vocabulary.name + '-to'" v-model="criterion.value[1]" v-on:change="onInput()">
    </div>

  </template>

  <template v-else-if="criterion.type === 'BOOLEAN'">

    <div class="form-check">
      <input type="checkbox" v-bind:id="vocabulary.name" v-bind:value="true" v-model="criterion.value" v-on:change="onInput()" class="form-check-input">
      <label class="form-check-label text-break" v-bind:for="vocabulary.name">{{ vocabulary.title | localize-string }}</label>
    </div>

  </template>

  <template v-else>

    <input type="text" class="form-control" v-model="criterion.value" v-on:change="onInput()">

  </template>
</div>  
</template>

<script>
import Criterion from "../../libs/Criterion";

import Vue from "vue";

export default {
  props: {
    vocabulary: {
      type: Object,
      required: true
    },
    query: Object,
    termsFilter: String
  },
  data: function () {
    return {
      showAll: false
    }
  },
  computed: {
    criterion() {
      let output = null;
      if (this.vocabulary) {
        output = new Criterion(this.vocabulary);

        if (this.query) {
          output.query = this.query;
        }
      }

      return output;
    },
    filteredTerms() {
      if (this.criterion.type !== "TERMS") return [];

      const localizeStringFunction = Vue.filter("localize-string") || ((val) => val[0].text);

      return (this.vocabulary.terms || []).filter(term => {
        return (!this.termsFilter || this.termsFilter.trim().length === 0) || 
        localizeStringFunction(this.vocabulary.title).toLowerCase().indexOf(this.termsFilter.toLowerCase()) > -1 || 
        term.name.toLowerCase().indexOf(this.termsFilter.toLowerCase()) > -1 || 
        localizeStringFunction(term.title).toLowerCase().indexOf(this.termsFilter.toLowerCase()) > -1;
      });
    },
    terms() {
      let terms = this.filteredTerms;

      if (!this.showAll && terms.length > 12) {
        terms = terms.slice(0,12);
      }

      return terms;
    }
  },
  watch: {
    query(val) {
      if (val) this.criterion.query = val;
    }  
  },
  methods: {
    onInput() {
      this.$emit("update-query", this.criterion);
    },
    switchMoreLess() {
      this.showAll = !this.showAll;
    },
    showMoreLess() {
      return this.filteredTerms.length > 12;
    }
  }
}
</script>