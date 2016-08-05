import m from 'mithril';

import { generateMaze } from 'app/maze';

import './gridworld.less';

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
    ctrl.maze = generateMaze(10, 10);
  },
  view (ctrl) {
    return m('.GridWorld', [
      m('.maze', ctrl.maze.map(row => {
        return m('.row', row.map(grid => {
          let text = (grid == 0 ? '' : grid);
          return m('.grid', {
            style: {
              backgroundColor: valueToColor(grid)
            }
          }, [
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
