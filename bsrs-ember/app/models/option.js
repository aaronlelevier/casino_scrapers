import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend({
  simpleStore: Ember.inject.service(),
  //used to toggle checked in list view.  Each loops makes managing checked property quite difficult except in model
  isChecked: false,
  text: attr(''),
  order: attr(''),
  removeRecord(){
    Ember.run(() => {
      this.get('simpleStore').remove('option', this.get('id'));
    });
  },
  serialize() {
    return {
      id: this.get('id'),
      text: this.get('text'),
      order: parseInt(this.get('order'), 10)
    };
  }
});
