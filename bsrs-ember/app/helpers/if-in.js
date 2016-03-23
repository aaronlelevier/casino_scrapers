import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    let elem = params[0];
    let list = params[1];
    return list.includes(elem);
});