import m from 'mithril';

import { generateMaze } from 'app/maze';

import './gridworld.less';

const GridWorld = {
  controller () {
    const ctrl = this;
    ctrl.maze = generateMaze(10, 10);
  },
  view (ctrl) {
    return m('.GridWorld', [
      m('.maze', ctrl.maze.map(row => {
        return m('.row', row.map(grid => {
          let text = '';
          if(grid !== 0 ) {
            text = grid;
          }
          let goal = '';
          if(grid > 50) {
            goal = '.goal';
          }
          return m('.grid' + goal, [
            m('.triangle.top', m('span', 'T')),
            m('.triangle.right', m('span', 'R')),
            m('.triangle.bottom', m('span', 'B')),
            m('.triangle.left', m('span', 'L')),
            m('.text', text),
          ]);
        }));
      })),
    ]);
  }
};

export default GridWorld;
