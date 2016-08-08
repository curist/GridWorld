import m from 'mithril';

import { generateMaze } from 'app/maze';
import { Q, updateQ, reset } from 'app/qgrids';


const debug = require('debug')('app/views/GridWorld');

import './gridworld.less';

const ALPHA = 0.4;
const GAMMA = 0.8;
const EPSILON = 0.8;
const M = 6;
const N = 6;

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

    ctrl.speedLevel = m.prop(3);

    ctrl.epsilon = m.prop(EPSILON);

    ctrl.epsilons = [ 1, 0.8, 0.5, 0.3, 0 ];

    ctrl.faster = () => {
      const lv = ctrl.speedLevel();
      if(lv < 5) {
        ctrl.speedLevel(lv + 1);
      }
      ctrl.resetTraverse();
    };

    ctrl.slower = () => {
      const lv = ctrl.speedLevel();
      if(lv > 1) {
        ctrl.speedLevel(lv - 1);
      }
      ctrl.resetTraverse();
    };

    ctrl.getSpeedText = () => {
      const lv = ctrl.speedLevel();
      const levels = {
        1: 'slowest',
        2: 'slow',
        3: 'normal',
        4: 'fast',
        5: 'fastest'
      };
      return levels[lv];
    };

    ctrl.getSpeedMs = () => {
      const lv = ctrl.speedLevel();
      const levels = {
        1: 1000,
        2: 500,
        3: 300,
        4: 100,
        5: 30,
      };
      return levels[lv];
    };

    // available directions
    const directions = {
      up: [-1, 0],
      down: [1, 0],
      left: [0, -1],
      right: [0, 1],
    };

    function canGoDirection(direction) {
      const [ v, h ] = directions[direction];
      const m = ctrl.current_m();
      const n = ctrl.current_n();
      const new_m = m + v;
      const new_n = n + h;
      if(new_m < 0 || new_m >= M || new_n < 0 || new_n >= N) {
        return false;
      }
      return true;
    }

    function handleAction(direction) {
      if(ctrl.reachedEndState()) {
        ctrl.resetStartPosition();
        return;
      }
      const [ v, h ] = directions[direction];
      const m = ctrl.current_m();
      const n = ctrl.current_n();
      const new_m = m + v;
      const new_n = n + h;
      if(!canGoDirection(direction)) {
        // out of bound
        return;
      }

      const reward = ctrl.maze[new_m][new_n];
      let maxNextQ = -Infinity;
      Object.keys(directions).forEach(dir => {
        const nextQ = Q(new_m, new_n, dir);
        if(nextQ > maxNextQ) {
          maxNextQ = nextQ;
        }
      });

      const newQ = (1 - ALPHA) * Q(m, n, direction) + ALPHA * (GAMMA * maxNextQ + reward);
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
      const reward = ctrl.maze[m][n];
      return reward> 50 || reward < -80;
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
      const dirs = Object.keys(directions).filter(dir => {
        return canGoDirection(dir);
      });
      if(Math.random() < ctrl.epsilon()) {
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
      }, ctrl.getSpeedMs());
    };

    ctrl.resetTraverse = () => {
      if(ctrl.interval) {
        clearInterval(ctrl.interval);
      }
      ctrl.interval = setInterval(() => {
        traverse();
        m.redraw();
      }, ctrl.getSpeedMs());
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
      m('h1', 'Gridworld'),
      m('p', [
        m('a', {
          href: 'https://en.wikipedia.org/wiki/Q-learning'
        }, 'Q Learning'),
        m('br'),
        m('a', {
          href: 'http://cs.stanford.edu/people/karpathy/reinforcejs/gridworld_td.html'
        }, 'Gridworld, a nice looking version'),
      ]),
      m('p', [
        m('h4', 'q learning parameters'),
        m('ul', [
          m('li', `learning rate: ${ALPHA}`),
          m('li', `gamma: ${GAMMA}, how much we value future reward`),
          m('li', m('span', [
            'epsilon: ',
            m('select', {
              value: ctrl.epsilon(),
              onchange: m.withAttr('value', ctrl.epsilon),
            }, ctrl.epsilons.map(eps => {
              return m('option', {
                value: eps,
              }, eps);
            })),
            ', chance to take random action',
          ])),
        ]),
      ]),
      m('.speed-control', [
        m('button', {
          onclick: ctrl.slower,
        }, '-'),
        m('span', ` speed: ${ctrl.getSpeedText()} `),
        m('button', {
          onclick: ctrl.faster,
        }, '+'),
      ]),
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
