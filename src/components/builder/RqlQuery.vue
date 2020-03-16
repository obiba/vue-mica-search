<template>
<div class="btn-group" role="group">
  <div class="btn-group">
    <button type="button" class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">{{ criterion }}</button>
    
    <div class="dropdown-menu" style="width: 25em;">
      <div class="container">{{ vocabulary.name }}</div>
      <div class="dropdown-divider"></div>

      <template v-if="criterion.type === 'TERMS'">

      <div class="container">
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-all'" name="terms-choice" value="exists" v-model="criterion.operator" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-all'">all</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-none'" name="terms-choice" value="missing" v-model="criterion.operator" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-none'">none</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-in'" name="terms-choice" value="in" v-model="criterion.operator" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-in'">in</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-not-in'" name="terms-choice" value="out" v-model="criterion.operator" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-not-in'">not in</label>
        </div>
      </div>          
      <div class="dropdown-divider"></div>
      <div class="container">
        <div class="input-group">
          <input type="text" class="form-control" v-model="termsFilter">
          <div class="input-group-append">
            <span class="input-group-text">Filter</span>
          </div>
        </div>
        <ul class="list-unstyled">
          <li v-for="term in terms" v-bind:key="term.name">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" v-bind:id="vocabulary.name + '-' + term.name" v-bind:value="term.name" v-model="criterion.value" v-on:change="onInput()">
              <label class="form-check-label" v-bind:for="vocabulary.name + '-' + term.name">{{ term.title[0].text }}</label>
            </div>
          </li>
        </ul>
      </div>

      </template>

      <template v-else-if="criterion.type === 'NUMERIC'">

      <div class="container">
        <div class="form-group">
          <label v-bind:for="vocabulary.name + 'from'">from</label>
          <input type="number" class="form-control" v-bind:id="vocabulary.name + '-from'" v-model="criterion.value[0]" v-on:input="onInput()">
        </div>
        <div class="form-group">
          <label v-bind:for="vocabulary.name + 'to'">to</label>
          <input type="number" class="form-control" v-bind:id="vocabulary.name + '-to'" v-model="criterion.value[1]" v-on:input="onInput()">
        </div>
      </div> 

      </template>

      <template v-else>

      <div class="container">
        <input type="text" class="form-control" v-model="criterion.value" v-on:input="onInput()">
      </div>      

      </template>
    </div>      
  </div>
  <button type="button" class="btn btn-secondary btn-sm" v-on:click="onRemove()"><span aria-hidden="true">&times;</span></button>
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
      return (this.vocabulary.terms || []).filter(term => {
        return (!this.termsFilter || this.termsFilter.trim().length === 0) || term.name.toLowerCase().indexOf(this.termsFilter.toLowerCase()) > -1;
      });
    }
  },
  methods: {
    onInput() {
      this.$emit("update-query", this.criterion);
    },
    onRemove() {
      this.$emit("remove-query", this.criterion);
    }
  }
}
</script>