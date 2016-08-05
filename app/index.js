import m from 'mithril';
import GridWorld from 'app/views/GridWorld';

import 'normalize.css';

function mountApplication() {
  const el = document.getElementById('app');
  m.mount(el, GridWorld);
}

function init() {
  require('app/styles/style.less');

  mountApplication();
}

window.onload = init;

if(module.hot) {
  module.hot.accept();
  init();

  // setup debug
  localStorage.debug = 'app/*';
}

