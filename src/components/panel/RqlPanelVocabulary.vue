<template>
<div class="container">
  <template v-if="type === 'TERMS'">

    <div class="row row-cols-4">
      <span class="col" v-for="term in vocabulary.terms" v-bind:key="term.name">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-bind:id="vocabulary.name + '-' + term.name" v-bind:value="term.name" v-model="value.terms" v-on:change="onInput()">
          <label class="form-check-label" v-bind:for="vocabulary.name + '-' + term.name">{{ term.title[0].text }}</label>
        </div>
      </span>
    </div>  

  </template>

  <template v-else-if="type === 'NUMERIC'">

    <div class="form-group">
      <label v-bind:for="vocabulary.name + 'from'">from</label>
      <input type="number" class="form-control" v-bind:id="vocabulary.name + '-from'" v-model="value.from" v-on:input="onInput()">
    </div>
    <div class="form-group">
      <label v-bind:for="vocabulary.name + 'to'">to</label>
      <input type="number" class="form-control" v-bind:id="vocabulary.name + '-to'" v-model="value.to" v-on:input="onInput()">
    </div>

  </template>

  <template v-else-if="type === 'MATCH'">

    <input type="text" class="form-control" v-model="value.match" v-on:input="onInput()">

  </template>
</div>  
</template>

<script>
function isTermsQuery(vocabulary) {
  return Array.isArray(vocabulary.terms) && vocabulary.terms.length > 0;
}

function isNumericQuery(vocabulary) {
  return !Array.isArray(vocabulary.terms) && (vocabulary.attributes || []).filter(attribute => attribute.key === "type" && ["integer", "decimal"].indexOf(attribute.value) > -1).length === 1;
}

function isMatchQuery(vocabulary) {
  return !Array.isArray(vocabulary.terms);
}

function initialPayload(vocabulary, query) {
  let payload = {};

  if (query) {
    if (isTermsQuery(vocabulary)) {
      payload.operator = query.operator;

      if (query.operator === "exists") {
        payload.terms = [...vocabulary.terms];
      } else {
        payload.terms = Array.isArray(query.args[1]) ? query.args[1] : [query.args[1]];
      }      
    } else if (isNumericQuery(vocabulary)) {
      if (query.operator === "ge") {
        payload.from = query.args[1];
      } else if (query.operator === "le") {
        payload.to = query.args[1];
      } else if (query.operator === "between") {
        payload.from = query.args[1][0];
        payload.to = query.args[1][1];
      }

      if (["ge", "le", "between"].indexOf(query.operator) > -1) {
        payload.operator = "exists";
      } else {
        payload.operator = "missing";
      }
    } else if (isMatchQuery(vocabulary)) {
      payload.match = query.args[0];
    }    
  } else {
    if (isTermsQuery(vocabulary)) {
      payload.terms = [];
    } else if (isNumericQuery(vocabulary)) {
      payload.from = undefined;
      payload.to = undefined;
    } else if (isMatchQuery(vocabulary)) {
      payload.match = undefined;
    }
  }

  return payload;
}

function finalPayload(vocabulary, payload) {
  let args = null;

  if (isTermsQuery(vocabulary)) {
    if (Array.isArray(payload.terms) && payload.terms.length === vocabulary.terms.length) {
      payload.operator = "exists";
    } else {
      payload.operator = "in";
    }

    if (["exists", "missing"].indexOf(payload.operator) > -1) {
      payload.terms = [...vocabulary.terms];
    }

    args = payload.terms;
  } else if (isNumericQuery(vocabulary)) {
    if (payload.from !== undefined && payload.to === undefined) {
      payload.operator = "ge";
      args = [payload.from];
    } else if (payload.from === undefined && payload.to !== undefined) {
      payload.operator = "le";
      args = [payload.to];
    } else if (payload.from !== undefined && payload.to !== undefined) {
      payload.operator = "between";
      args = [payload.from, payload.to];
    }

    if (["exists", "missing"].indexOf(payload.operator) > -1) {
      payload.from = null;
      payload.to = null;
    }
  } else if (isMatchQuery(vocabulary)) {
    args = [payload.match];
  }

  return {args, operator: payload.operator};
}

export default {
  props: {
    vocabulary: {
      type: Object,
      required: true
    },
    query: Object
  },
  computed: {
    value() {
      return initialPayload(this.vocabulary, this.query);
    },
    type() {
      if (isTermsQuery(this.vocabulary)) {
        return "TERMS";
      } else if (isNumericQuery(this.vocabulary)) {
        return "NUMERIC";
      } else if(isMatchQuery(this.vocabulary)) {
        return "MATCH";
      }

      return undefined;
    }
  },
  watch: {
    query(val) {
      this.value = initialPayload(this.vocabulary, val);
    }  
  },
  methods: {
    onInput() {
      this.$emit("update-query", {vocabularyName: this.vocabulary.name, value: finalPayload(this.vocabulary, this.value)});
    }
  }
}
</script>