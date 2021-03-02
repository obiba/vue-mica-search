<template>
  <div v-show="visible === true" class="coverage-row-popup" id="row-popup">
    <div class="coverage-row-popup-content">
        <table class="table table-striped table-condensed p-0 m-0">
          <tr>
            <th v-for="(value, index) in headers" v-bind:key="index">{{value}}</th>
          </tr>
          <tr>
            <td v-for="(value, index) in content" v-bind:key="index">{{value}}</td>
          </tr>
        </table>
    </div>
  </div>  
</template>

<script>
import Vue from 'vue';
import RowPopupState from './RowPopupState';
const MARGIN = 15;

export default {
  name: 'RowPopup',
  props: {
    state: RowPopupState
  },
  data() {
    return {
      container: null,
      element: null,
      scrollHandler: null,
      mouseMoveHandler: null,
      timeoutId: null,
      headersMap: {},
      headers: null,
      content: null,
      visible: true
    }
  },
  mounted() {
    this.container = document.querySelector("#coverage-table-container");
    this.element = document.querySelector("#row-popup");
    this.scrollHandler = this.onScroll.bind(this);
    this.mouseMoveHandler = this.onMouseMove.bind(this);

    const translate = (key) => Vue.filter('translate')(key);

    this.headersMap = {
      dceId: [
        translate('search.coverage-dce-cols.study'), 
        translate('search.coverage-dce-cols.population'), 
        translate('search.coverage-dce-cols.dce')
      ],
      datasetId: [translate('search.coverage-buckets.dataset')],
      studyId: [translate('search.coverage-buckets.study')]
    };

  },
  methods: {
    initContent() {
      const model = this.state.getModel();
      this.content = model.title.trim().split(/:/);
      this.headers = this.headersMap[model.field].slice(0);

      // cleanup content when there are no DCE
      if ("dceId" === model.field && this.content.length < 3) {
        this.headers.pop();
      }
    },
    beforeDestroy() {
      clearTimeout(this.timeoutId);
      this.container.removeEventListener("scroll", this.scrollHandler);
      window.removeEventListener("mousemove", this.mouseMoveHandler);
    },    
    onMouseMove(event) {
      const rect = this.element.getBoundingClientRect();
      const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
      const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
      const xInViewPort = windowWidth - rect.width - MARGIN > event.clientX;
      const yInViewPort = windowHeight - rect.height - MARGIN > event.clientY;
      this.element.style.left = (xInViewPort ? event.clientX  + MARGIN : event.clientX - MARGIN - rect.width) + "px";
      this.element.style.top = (yInViewPort ? event.clientY + MARGIN : event.clientY - MARGIN - rect.height) + "px";
    },
    onScroll() {
      this.visible = 
        this.container.getBoundingClientRect().left > this.state.getElement().children[1].getBoundingClientRect().x;
    }
  },
  watch: {
    state: function(/*value*/) {
      if (this.state) {
        this.initContent();
      }

      this.$nextTick(() => {
        if (this.state) {
          this.container.addEventListener("scroll", this.scrollHandler);
          window.addEventListener("mousemove", this.mouseMoveHandler);
          this.onScroll();
        } else {
          this.container.removeEventListener("scroll", this.scrollHandler);
          window.removeEventListener("mousemove", this.mouseMoveHandler);
          this.content = null;
          this.headers = null;
        }
      });
    }
  }

}
</script>

<style>
.coverage-row-popup {
  position: fixed;
  z-index: 9999;
}
.coverage-row-popup .coverage-row-popup-content {
  white-space: normal;
  word-break: normal;
  word-spacing: normal;
  word-wrap: normal;
  background-color: #fff;
  background-clip: padding-box;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}
.coverage-row-popup table tbody th {
  font-size: 12px !important;
  width: auto !important;
}
.coverage-row-popup table tbody td {
  font-size: 12px !important;
  color: black !important;
}

</style>