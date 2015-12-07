import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    let noun = params[0];
    let column = params[1];
    return 't-' + noun + '-' + column.replace('.', '-');
});
