var equal = function(first, second) {
  if (first instanceof Array && second instanceof Array) {
    return first.length === second.length && first.every((v, i) => v === second[i]);
  }
  return first === second;
};

export default equal;
