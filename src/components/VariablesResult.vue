<template>
  <div>
    <table id="vosr-var-result">
      <thead>
        <tr>
          <th>User ID</th>
          <th>User Name</th>
          <th>User Email</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
  </div>
</template>
<script>
import $ from 'jquery'
import DataTable from 'datatables.net-dt'
import VariablesResultParser from '../libs/parsers/VariablesResultParser';

export default {  
  name: 'VariablesResult',  
  data () {
    return {
      count:0,
      dataTable: null
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
    this.dataTable = $('#vosr-var-result').DataTable({});
    this.getEventBus().register('query-type-selection', this.onSomeEvent);
    new VariablesResultParser().data.forEach(element => {
      this.dataTable
      .row.add([
        element.id,
        `<a href="#">+${element.name}</a>`,
        element.email
      ])
      .draw(false);
    });
  },
  beforeDestroy() {
    this.getEventBus().unregister('query-type-selection', this.onSomeEvent)
  }
}
</script>