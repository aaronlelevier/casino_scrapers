import Ember from 'ember';

var NewMixin = Ember.Mixin.create({
    save() {
        this.set('new', undefined);
        this._super();
    }
});

export default NewMixin;
