import m from 'mithril';

import { generateMaze } from 'app/maze';
import { Q, updateQ } from 'app/qgrids';


const debug = require('debug')('app/views/GridWorld');

import './gridworld.less';

const ALPHA = 0.2;
const GAMMA = 0.5;
const M = 10;
const N = 10;

function valueToColor(value) {
  const weight = Math.min(Math.abs(value), 100) / 100;
  if(value >= 0) {
    return `rgba(0,255,0,${weight})`;
  } else {
    return `rgba(255,0,0,${weight})`;
  }
}

const GridWorld = {
  controller () {
    const ctrl = this;
    ctrl.maze = generateMaze(M, N);

    ctrl.current_m = m.prop(0);
    ctrl.current_n = m.prop(0);

    // available actions
    const actions = {
      up: [-1, 0],
      down: [1, 0],
      left: [0, -1],
      right: [0, 1],
    };

    function handleAction(direction) {
      const [ v, h ] = actions[direction];
      const m = ctrl.current_m();
      const n = ctrl.current_n();
      const new_m = m + v;
      const new_n = n + h;
      if(new_m < 0 || new_m >= M || new_n < 0 || new_n >= N) {
        // out of bound
        return updateQ(m, n, direction, -10000);
      }
    }

    ctrl.resetStartPosition = () => {
      const m = Math.floor(Math.random() * M);
      const n = Math.floor(Math.random() * N);
      ctrl.current_m(m);
      ctrl.current_n(n);
    };
    ctrl.resetStartPosition();

    ctrl.handleKeyUp = (e) => {
      debug(e);
      const { key } = e;
      const direction = key.toLowerCase().replace('arrow', '');
      if(actions[direction]) {
        handleAction(direction);
      }
    };

    window.addEventListener('keyup', ctrl.handleKeyUp);

    ctrl.onunload = () => {
      window.removeEventListener('keyup', ctrl.handleKeyUp);
    };

  },
  view (ctrl) {
    const current_m = ctrl.current_m();
    const current_n = ctrl.current_n();
    return m('.GridWorld', [
      m('.maze', ctrl.maze.map((row, x) => {
        return m('.row', row.map((grid, y) => {
          let current = '';
          if(x == current_m && y == current_n) {
            current = '.current';
          }
          let text = (grid == 0 ? '' : grid);
          // values
          const tvalue = Q(x, y, 'up');
          const tcolor = valueToColor(tvalue);
          const rvalue = Q(x, y, 'right');
          const rcolor = valueToColor(rvalue);
          const bvalue = Q(x, y, 'down');
          const bcolor = valueToColor(bvalue);
          const lvalue = Q(x, y, 'left');
          const lcolor = valueToColor(lvalue);
          return m('.grid' + current, {
            style: {
              backgroundColor: valueToColor(grid)
            }
          }, [
            m('.triangle.top', {
              style: `border-top-color:${tcolor}`
            }, m('span', tvalue)),
            m('.triangle.right', {
              style: `border-right-color:${rcolor}`
            }, m('span', rvalue)),
            m('.triangle.bottom', {
              style: `border-bottom-color:${bcolor}`
            }, m('span', bvalue)),
            m('.triangle.left', {
              style: `border-left-color:${lcolor}`
            }, m('span', lvalue)),
            m('.text', text),
          ]);
        }));
      })),
    ]);
  }
};

export default GridWorld;
