import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend({
  store: inject('main'),
  text: attr(''),
  order: attr(''),
  removeRecord(){
    Ember.run(() => {
      this.get('store').remove('option', this.get('id'));
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
