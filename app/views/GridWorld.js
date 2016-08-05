import m from 'mithril';

import { generateMaze } from 'app/maze';
import { Q, updateQ, reset } from 'app/qgrids';


const debug = require('debug')('app/views/GridWorld');

import './gridworld.less';

const ALPHA = 0.2;
const GAMMA = 0.8;
const EPSILON = 0.8;
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

    ctrl.showQvalue = m.prop(false);

    // available directions
    const directions = {
      up: [-1, 0],
      down: [1, 0],
      left: [0, -1],
      right: [0, 1],
    };

    function handleAction(direction) {
      const [ v, h ] = directions[direction];
      const m = ctrl.current_m();
      const n = ctrl.current_n();
      const new_m = m + v;
      const new_n = n + h;
      if(new_m < 0 || new_m >= M || new_n < 0 || new_n >= N) {
        // out of bound
        return updateQ(m, n, direction, -10000);
      }

      const reward = ctrl.maze[new_m][new_n];
      let maxNextQ = -Infinity;
      Object.keys(directions).forEach(dir => {
        const nextQ = Q(new_m, new_n, dir);
        if(nextQ > maxNextQ) {
          maxNextQ = nextQ;
        }
      });

      const newQ = (1 - ALPHA) * Q(m, n, direction) + ALPHA * (reward + maxNextQ);
      updateQ(m, n, direction, newQ);
      ctrl.current_m(new_m);
      ctrl.current_n(new_n);
    }

    ctrl.resetStartPosition = () => {
      const m = Math.floor(Math.random() * M);
      const n = Math.floor(Math.random() * N);
      ctrl.current_m(m);
      ctrl.current_n(n);
    };
    ctrl.resetStartPosition();

    ctrl.reachedEndState = () => {
      const m = ctrl.current_m();
      const n = ctrl.current_n();
      return ctrl.maze[m][n] > 50;
    };

    ctrl.handleKeyUp = (e) => {
      const { key } = e;
      const direction = key.toLowerCase().replace('arrow', '');
      if(directions[direction]) {
        handleAction(direction);
        m.redraw();
      }
    };

    ctrl.newMaze = () => {
      ctrl.maze = generateMaze(M, N);
      reset();
    };

    ctrl.toggleShowQvalue = () => {
      ctrl.showQvalue(!ctrl.showQvalue());
    };

    function traverse() {
      if(ctrl.reachedEndState()) {
        ctrl.resetStartPosition();
        return;
      }
      const dirs = Object.keys(directions);
      if(Math.random() < EPSILON) {
        // take a random move
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        handleAction(dir);
        return;
      }
      const m = ctrl.current_m();
      const n = ctrl.current_n();
      let bestDir, bestDirValue = -Infinity;
      dirs.forEach(dir => {
        const q = Q(m, n, dir);
        if(q > bestDirValue) {
          bestDirValue = q;
          bestDir = dir;
        }
      });
      handleAction(bestDir);
    }

    ctrl.interval = null;
    ctrl.toggleTraverse = () => {
      if(ctrl.interval) {
        clearInterval(ctrl.interval);
        ctrl.interval = null;
        return;
      }
      ctrl.interval = setInterval(() => {
        traverse();
        m.redraw();
      }, 30);
    };

    window.addEventListener('keydown', ctrl.handleKeyUp);

    ctrl.onunload = () => {
      window.removeEventListener('keydown', ctrl.handleKeyUp);
      if(ctrl.interval) {
        clearInterval(ctrl.interval);
        ctrl.interval = null;
      }
    };

  },
  view (ctrl) {
    const current_m = ctrl.current_m();
    const current_n = ctrl.current_n();
    return m('.GridWorld', [
      m('button', {
        onclick: ctrl.newMaze.bind(ctrl),
      }, 'new maze'),
      m('button', {
        onclick: ctrl.toggleTraverse.bind(ctrl),
      }, (function() {
        if(ctrl.interval === null) {
          return 'start auto traverse';
        } else {
          return 'stop auto traverse';
        }
      })()),
      m('button', {
        onclick: reset,
      }, 'reset q table'),
      m('button', {
        onclick: ctrl.toggleShowQvalue.bind(ctrl),
      }, 'toggle show q values'),
      m('.maze', ctrl.maze.map((row, x) => {
        return m('.row', row.map((grid, y) => {
          let current = (x == current_m && y == current_n) ? '.current' : '';
          let show = ctrl.showQvalue() ? '.show' : '';
          // values
          const tvalue = Q(x, y, 'up');
          const tcolor = valueToColor(tvalue);
          const rvalue = Q(x, y, 'right');
          const rcolor = valueToColor(rvalue);
          const bvalue = Q(x, y, 'down');
          const bcolor = valueToColor(bvalue);
          const lvalue = Q(x, y, 'left');
          const lcolor = valueToColor(lvalue);
          return m('.grid' + show + current, {
            style: {
              backgroundColor: valueToColor(grid)
            }
          }, [
            m('.triangle.top', {
              style: `border-top-color:${tcolor}`
            }, m('span', tvalue || '')),
            m('.triangle.right', {
              style: `border-right-color:${rcolor}`
            }, m('span', rvalue || '')),
            m('.triangle.bottom', {
              style: `border-bottom-color:${bcolor}`
            }, m('span', bvalue || '')),
            m('.triangle.left', {
              style: `border-left-color:${lcolor}`
            }, m('span', lvalue || '')),
            m('.text', (function () {
              if(current) {
                return m.trust('&#9786;');
              } else {
                return grid || '';
              }
            })()),
          ]);
        }));
      })),
    ]);
  }
};

export default GridWorld;
