<template>
<div class="btn-group" role="group">
  <div class="btn-group">
    <button type="button" class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">{{ vocabulary.title[0].text }}</button>
    
    <div class="dropdown-menu" style="width: 25em;">
      <div class="container">{{ vocabulary.name }}</div>
      <div class="dropdown-divider"></div>

      <template v-if="type === 'TERMS'">

      <div class="container">
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-all'" value="exists" v-model="value.operator" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-all'">all</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-none'" value="missing" v-model="value.operator" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-none'">none</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-in'" value="in" v-model="value.operator" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-in'">in</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-not-in'" value="out" v-model="value.operator" v-on:change="onInput()">
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
              <input class="form-check-input" type="checkbox" v-bind:id="vocabulary.name + '-' + term.name" v-bind:value="term.name" v-model="value.terms" v-on:change="onInput()">
              <label class="form-check-label" v-bind:for="vocabulary.name + '-' + term.name">{{ term.title[0].text }}</label>
            </div>
          </li>
        </ul>
      </div>

      </template>

      <template v-else-if="type === 'NUMERIC'">

      <div class="container">
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-all'" value="exists" v-model="value.operator" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-all'">all</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" v-bind:id="'radio-' + vocabulary.name + '-none'" value="missing" v-model="value.operator" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="'radio-' + vocabulary.name + '-none'">none</label>
        </div>
      </div>          
      <div class="dropdown-divider"></div>
      <div class="container">
        <div class="form-group">
          <label v-bind:for="vocabulary.name + 'from'">from</label>
          <input type="number" class="form-control" v-bind:id="vocabulary.name + '-from'" v-model="value.from" v-on:input="onInput()">
        </div>
        <div class="form-group">
          <label v-bind:for="vocabulary.name + 'to'">to</label>
          <input type="number" class="form-control" v-bind:id="vocabulary.name + '-to'" v-model="value.to" v-on:input="onInput()">
        </div>
      </div> 

      </template>

      <template v-else-if="type === 'MATCH'">

      <div class="container">
        <input type="text" class="form-control" v-model="value.match" v-on:input="onInput()">
      </div>      

      </template>
    </div>      
  </div>
  <button type="button" class="btn btn-secondary btn-sm" v-on:click="onRemove()"><span aria-hidden="true">&times;</span></button>
</div>  
</template>

<script>
function isTermsQuery(operator, vocabulary) {
  return Array.isArray(vocabulary.terms) && vocabulary.terms.length > 0 && ["in", "out"].indexOf(operator) > -1;
}

function isNumericQuery(operator, vocabulary) {
  return !Array.isArray(vocabulary.terms) && ["ge", "le", "between"].indexOf(operator) > -1;
}

function isMatchQuery(operator) {
  return ["match"].indexOf(operator) > -1;
}

function initialPayload(vocabulary, operator, args) {
  let payload = {};

  if (isTermsQuery(operator, vocabulary)) {
      payload.operator = operator;

      if (operator === "exists") {
        payload.terms = [...vocabulary.terms];
      } else {
        payload.terms = Array.isArray(args[1]) ? args[1] : [args[1]];
      }      
  } else if (isNumericQuery(operator, vocabulary)) {
    if (operator === "ge") {
      payload.from = args[1];
    } else if (operator === "le") {
      payload.to = args[1];
    } else if (operator === "between") {
      payload.from = args[1][0];
      payload.to = args[1][1];
    }

    if (["ge", "le", "between"].indexOf(operator) > -1) {
      payload.operator = "exists";
    } else {
      payload.operator = "missing";
    }
  } else if (isMatchQuery(operator)) {
    payload.match = args[0];
  }

  return payload;
}

function finalPayload(vocabulary, operator, payload) {
  if (isTermsQuery(operator, vocabulary)) {
    if (["exists", "missing"].indexOf(payload.operator) > -1) {
      payload.terms = [];
    }
  } else if (isNumericQuery(operator, vocabulary)) {
    if (payload.from !== undefined && payload.to === undefined) {
      payload.operator = "ge";
    } else if (payload.from === undefined && payload.to !== undefined) {
      payload.operator = "le";
    } else if (payload.from !== undefined && payload.to !== undefined) {
      payload.operator = "between";
    }

    if (payload.operator === "missing") {
      payload.from = null;
      payload.to = null;
    }
  }

  return payload;
}

export default {
  props: {
    operator: {
      type: String,
      required: true
    },
    args: {
      type: Array,
      required: true
    },
    vocabulary: {
      type: Object,
      required: true
    }
  }, 
  data() {
    return {
      termsFilter: ""
    };
  },
  computed: {
    value() {
      return initialPayload(this.vocabulary, this.operator, this.args);
    },
    type() {
      if (isTermsQuery(this.operator, this.vocabulary)) {
        return "TERMS";
      } else if (isNumericQuery(this.operator, this.vocabulary)) {
        return "NUMERIC";
      } else if(isMatchQuery(this.operator)) {
        return "MATCH";
      }

      return undefined;
    },
    terms() {
      return (this.vocabulary.terms || []).filter(term => {
        return (!this.termsFilter || this.termsFilter.trim().length === 0) || term.name.toLowerCase().indexOf(this.termsFilter.toLowerCase()) > -1;
      });
    }
  },
  methods: {
    onInput() {
      this.$emit("update-query", {vocabularyName: this.vocabulary.name, value: finalPayload(this.vocabulary, this.operator, this.value)});
    },
    onRemove() {
      this.$emit("remove-query", {vocabularyName: this.vocabulary.name});
    }
  }
}
</script>