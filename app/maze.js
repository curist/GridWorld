// get a random number, min <= number < max
function randint(min, max) {
  const range = max - min;
  return Math.floor(Math.random() * range) + min;
}

// generate a 2d array with dimens m x n
export function generateMaze(m, n) {
  let maze = [];
  for(let i = 0; i < m; i++) {
    let row = [];
    for(let j = 0; j < n; j++) {
      let num = 0;
      if(Math.random() < 0.15) {
        num = -100;
      } else if (Math.random() < 0.3) {
        num = -10;
      }
      row.push(num);
    }
    maze.push(row);
  }

  // pick a goal state
  let m_target = randint(0, m);
  let n_target = randint(0, n);
  maze[m_target][n_target] = 100;

  return maze;
}

