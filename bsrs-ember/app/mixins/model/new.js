import Ember from 'ember';

var NewMixin = Ember.Mixin.create({
  save() {
    this.set('new', undefined);
    this.set('new_pk', undefined);
    this._super();
  }
});

export default NewMixin;
