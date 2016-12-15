function length(p0, p1) {
  return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
}

function midpoint(p0, p1) {
  return {x: p0.x + (p1.x - p0.x) / 2, y: p0.y + (p1.y - p0.y) / 2};
}

function dir(p0, p1) {
  var l = length(p0, p1);
  return {x: (p1.x - p0.x) / l, y: (p1.y - p0.y) / l};
}

function orthogonal(dir) {
  return {x: -dir.y, y: dir.x};
}

function quadraticMidpoint(p0, p1) {
  var k = 0.2;
  var l = length(p0, p1);
  var d = dir(p0, p1); 
  var orth = orthogonal(d);
  var mid = midpoint(p0, p1);
  var kl = l * k;
  return {x: mid.x + kl * orth.x, y: mid.y + kl * orth.y};
}

function getMidpointOfPath(path) {
  var length = path.getTotalLength();
  var midpoint = path.getPointAtLength(length * 0.5);
  return midpoint;
}