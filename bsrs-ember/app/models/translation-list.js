import Ember from 'ember';

export default Ember.Object.extend({
    key: Ember.computed.alias('id')
});
