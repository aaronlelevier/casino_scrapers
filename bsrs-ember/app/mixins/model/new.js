import Ember from 'ember';

var NewMixin = Ember.Mixin.create({
  save() {
    this._super();
    this.set('new', undefined);
    this.set('new_pk', undefined);
  }
});

export default NewMixin;
