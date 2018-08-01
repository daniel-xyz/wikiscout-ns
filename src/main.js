import Vue from 'nativescript-vue'

import Map from './pages/Map'

import store from './store'

import './styles.scss'

//Vue.config.silent = false;

Vue.registerElement('Mapbox', () => require('nativescript-mapbox').MapboxView)

new Vue({
  render: h => h(Map),

  store,
}).$start()
