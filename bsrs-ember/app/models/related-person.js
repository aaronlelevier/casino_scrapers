import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend({
  fullname: Ember.computed('first_name', 'last_name', function() {
    const { first_name, last_name } = this.getProperties('first_name', 'last_name');
    return first_name + ' ' + last_name;
  }),
});

