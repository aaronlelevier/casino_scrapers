import Ember from 'ember';

export default Ember.Object.extend({
    init: function() {
        this.set('requested', []);
    },
    pages: Ember.computed(function() {
        return Ember.ArrayProxy.extend({
            content: Ember.computed(function () {
                return Ember.A(this.get('source'));
            }).property()
        }).create({
            source: this.get('requested')
        });
    })
});
