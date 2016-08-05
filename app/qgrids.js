let qgrids = {};

// actions = [up, right, down, left]

export function init() {
  qgrids = {};
}

function deepGet(obj, paths) {
  if(!paths || paths.length == 0 || !obj) {
    return obj;
  }
  var p = paths.shift();
  return deepGet(obj[p], paths);
}

export function Q(m, n, direction) {
  return deepGet(qgrids, [m, n, direction]) || 0;
}

export function updateQ(m, n, direction, value) {
  qgrids[m] = qgrids[m] || {};
  qgrids[m][n] = qgrids[m][n] || {};
  qgrids[m][n][direction] = value;
}
