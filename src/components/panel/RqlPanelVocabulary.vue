<template>
<div class="container">
  <template v-if="criterion.type === 'TERMS'">

    <div class="row row-cols-4">
      <span class="col" v-for="term in vocabulary.terms" v-bind:key="term.name">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-bind:id="vocabulary.name + '-' + term.name" v-bind:value="term.name" v-model="criterion.value" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="vocabulary.name + '-' + term.name">{{ term.title | localize-string }}</label>
        </div>
      </span>
    </div>  

  </template>

  <template v-else-if="criterion.type === 'NUMERIC'">

    <div class="form-group">
      <label v-bind:for="vocabulary.name + 'from'">{{ "global.from" | translate }}</label>
      <input type="number" class="form-control" v-bind:id="vocabulary.name + '-from'" v-model="criterion.value[0]" v-on:input="onInput()">
    </div>
    <div class="form-group">
      <label v-bind:for="vocabulary.name + 'to'">{{ "global.to" | translate }}</label>
      <input type="number" class="form-control" v-bind:id="vocabulary.name + '-to'" v-model="criterion.value[1]" v-on:input="onInput()">
    </div>

  </template>

  <template v-else>

    <input type="text" class="form-control" v-model="criterion.value" v-on:input="onInput()">

  </template>
</div>  
</template>

<script>
import Criterion from "../../libs/Criterion";

export default {
  props: {
    vocabulary: {
      type: Object,
      required: true
    },
    query: Object
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
    }
  }
}
</script>