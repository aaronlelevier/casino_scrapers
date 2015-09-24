import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    let column = params[1];
    let collection = params[0];
    let last = collection.indexOf(column) === collection.length - 1;
    return last ? 'text-right' : '';
});
