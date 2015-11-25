import Ember from 'ember';

export default Ember.Object.extend({
    filepath: Ember.computed('file', function() {
        const file = this.get('file');
        return `/media/${file}`;
    })
});
