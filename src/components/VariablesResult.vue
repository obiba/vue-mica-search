<template>
  <div>
    <button @click="increment">{{ text }}</button>
  </div>
</template>
<script>
export default {
  name: 'VariablesResult',  
  data () {
    return {
      count: 0
    }
  },
  computed: {
    times () {
      return this.count > 1
        ? 'times'
        : 'time'
    },
    text () {
      return `I have been clicked ${this.count} ${this.times}`
    }
  },
  methods: {
    onSomeEvent (payload) {
       console.log(`Got event query-type-selection ${payload}`);
    },
    increment () {
      this.count += 1
      this.getEventBus().$emit('VueObibaVariablesResult', {count: this.count});
    }
  },
  mounted() {
    this.getEventBus().register('query-type-selection', this.onSomeEvent)
  },
  beforeDestroy() {
    this.getEventBus().unregister('query-type-selection', this.onSomeEvent)
  }
}
</script>