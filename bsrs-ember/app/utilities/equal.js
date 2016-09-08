var equal = function(first, second) {
    if (first instanceof Array && second instanceof Array) {
        return first.length === second.length && first.every((v, i) => v === second[i]);
        // return Ember.$(first).not(second).get().length === 0 && Ember.$(second).not(first).get().length === 0;
    }
    return first === second;
};

export default equal;
