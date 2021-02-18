<template>
<div class="btn-group btn-sm dropdown my-0">
  <button type="button" class="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown">
    <i class="fa fa-info-circle" v-bind:title="vocabulary.title | localize-string"></i>
    <span class="pl-1">{{ getCriterionAsString() }}</span>
  </button>
  
  <div ref="menu" class="dropdown-menu" style="width: 25em;">
    <div class="container" v-bind:title="vocabulary.description | localize-string"><i class="fa fa-info-circle"></i> {{ vocabulary.title | localize-string }}</div>
    <div class="dropdown-divider"></div>

    <template v-if="criterion.type === 'TERMS'">

    <div class="container">
      <div class="form-check">
        <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-all'" v-bind:name="vocabulary.name + '-terms-choice'" value="exists" v-model="criterion.operator" v-on:change="onInput()">
        <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-all'">{{ "search.any" | translate }}</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-none'" v-bind:name="vocabulary.name + '-terms-choice'" value="missing" v-model="criterion.operator" v-on:change="onInput()">
        <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-none'">{{ "search.none" | translate }}</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-in'" v-bind:name="vocabulary.name + '-terms-choice'" value="in" v-model="criterion.operator" v-on:change="onInput()">
        <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-in'">{{ "search.in" | translate }}</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-not-in'" v-bind:name="vocabulary.name + '-terms-choice'" value="out" v-model="criterion.operator" v-on:change="onInput()">
        <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-not-in'">{{ "search.out" | translate }}</label>
      </div>
    </div>          
    <div class="dropdown-divider"></div>
    <div class="container">
      <div class="input-group mb-2">
        <input type="text" class="form-control" v-model="termsFilter">
        <div class="input-group-append">
          <span class="input-group-text">{{ "search.filter" | translate }}</span>
        </div>
      </div>
      <ul class="list-unstyled" style="max-height: 24em; overflow-y: auto;">
        <li v-for="term in terms" v-bind:key="term.name">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-bind:id="vocabulary.name + '-' + term.name" v-bind:value="term.name" v-bind:name="vocabulary.name + 'terms[]'" v-model="criterion.value" v-on:change="onInput()">
            <label class="form-check-label" v-bind:for="vocabulary.name + '-' + term.name" v-bind:title="term.description | localize-string">{{ term.title | localize-string }}</label>
          </div>
        </li>
      </ul>
    </div>

    </template>

    <template v-else-if="criterion.type === 'NUMERIC'">

    <div class="container">
      <div class="form-group">
        <label v-bind:for="vocabulary.name + 'from'">{{ "search.from" | translate }}</label>
        <input type="number" class="form-control" v-bind:id="vocabulary.name + '-from'" v-model="criterion.value[0]" v-on:change="onInput()">
      </div>
      <div class="form-group">
        <label v-bind:for="vocabulary.name + 'to'">{{ "search.to" | translate }}</label>
        <input type="number" class="form-control" v-bind:id="vocabulary.name + '-to'" v-model="criterion.value[1]" v-on:change="onInput()">
      </div>
    </div> 

    </template>

    <template v-else>

    <div class="container">
      <input type="text" class="form-control" v-model="criterion.value" v-on:change="onInput()">
    </div>      

    </template>
  </div>

  <button type="button" class="btn btn-secondary btn-sm" v-on:click="onRemove()"><span aria-hidden="true">&times;</span></button>
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
    query: Object
  }, 
  data() {
    return {
      termsFilter: ""
    };
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
    terms() {
      const localizeStringFunction = Vue.filter("localize-string") || ((val) => val[0].text);

      return (this.vocabulary.terms || []).filter(term => {
        return (!this.termsFilter || this.termsFilter.trim().length === 0) || localizeStringFunction(term.title).toLowerCase().indexOf(this.termsFilter.toLowerCase()) > -1;
      });
    }
  },
  methods: {
    getCriterionAsString() {
      const localizeStringFunction = Vue.filter("localize-string") || ((val) => val[0].text);
      return this.criterion.asString(localizeStringFunction);
    },
    onInput() {
      this.$emit("update-query", this.criterion);
    },
    onRemove() {
      this.$emit("remove-query", this.criterion);
    }
  },
  mounted() {
    const menuReference = this.$refs.menu;
    if (menuReference) {
      menuReference.addEventListener("click", event => event.stopPropagation());
    }
  }
}
</script>