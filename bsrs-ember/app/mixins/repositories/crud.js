import Ember from 'ember';

export default Ember.Mixin.create({
    fetch(id) {
        return this.get('store').find(this.get('type'), id);
    },
});

