import Ember from 'ember';

var uuid = Ember.Object.extend({
    v4: function() {
        return Ember.uuid();
    }
});

export default uuid;
