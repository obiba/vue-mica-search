<template>
<div>
  <div class="btn-group" role="group" aria-label="Basic example">
    <button type="button" v-bind:class="{active: selection.all}" class="btn btn-sm btn-info" v-on:click="onSelectionClicked('all')">All</button>
    <button type="button" v-bind:class="{active: selection.study}" class="btn btn-sm btn-info" v-on:click="onSelectionClicked('study')">Study</button>
    <button type="button" v-bind:class="{active: selection.harmonization}" class="btn btn-sm btn-info" v-on:click="onSelectionClicked('harmonization')">Harmonization</button>
  </div>
</div>
</template>

<script>
import Query from "rql/src/query";

export default {  
  name: 'StudyFilterShortcut',  
  data() {
    return {
      selection: {all: true, study: false, harmonization: false}
    }
  },
  methods: {
    buildClassNameArgs(key) {
      switch (key) {
        case 'study':
          return 'Study';

        case 'harmonization': 
          return 'HarmonizationStudy';
      }

      return ['Study', 'HarmonizationStudy'];
    },
    isAll(values) {
      return !values || Array.isArray(values) && values.length > 1;
    },
    isClassName(name, values) {
      return Array.isArray(values) ? values.length === 1 && values.indexOf(name) > -1 : values === name;
    },
    onLocationChanged(payload) {
      const tree = payload.tree;
      const classNameQuery = tree.search((name, args) => args.indexOf('Mica_study.className') > -1);
      if (classNameQuery) {
        const values = classNameQuery.args[1];
        this.selection.all = this.isAll(values);
        this.selection.study = this.isClassName('Study', values);
        this.selection.harmonization = this.isClassName('HarmonizationStudy', values);
      } else {
        this.selection = {all: true, study: false, harmonization: false};
      }
    },
    onSelectionClicked(selectionKey) {
      event.preventDefault();
      const classNameQuery = new Query('in', ['Mica_study.className', this.buildClassNameArgs(selectionKey)]);
      this.getEventBus().$emit('query-type-update', {target: 'study', query: classNameQuery});
    }
  },
  mounted() {
    console.log('Mounted study-filter-shortcut');
    this.getEventBus().register('location-changed', this.onLocationChanged.bind(this));
  },
  beforeDestory() {
    this.getEventBus().unregister('location-changed', this.onLocationChanged);
  }
}
</script>