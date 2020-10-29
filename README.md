# vue-mica-search

## Installing tools
```
npm install -g @vue/cli
npm install -g yarn # if you don't have it
```

## Project setup
```
yarn install
vue create <component-name-folder>
```

> See this projects `package.json` and `vue.config.js` for build rules and config. I chose a component library name all in CamelCase because in Mica components are only available thru this object: `Vue.use(Vue.use(VueMicaSearch.VariablesResult, ...)`. CamelCase looks more like a namespace, hence this naming convention.


### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build-lib
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
