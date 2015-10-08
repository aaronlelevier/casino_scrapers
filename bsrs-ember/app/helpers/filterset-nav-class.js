import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    return 't-' + params[0].replace(/\./g, '-') + '-navigation';
});
