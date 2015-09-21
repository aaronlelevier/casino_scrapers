import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    let item = params[0];
    let column = params[1];
    return Ember.get(item, column);
});
