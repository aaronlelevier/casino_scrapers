import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';

var PersonCurrent = Model.extend({
  store: inject('main'),
  role_name: Ember.computed(function(){
    let role = this.get('store').find('role', this.get('role'));
    return role.get('name');
  }),
  full_name: Ember.computed(function(){
    let first_name = this.get('first_name');
    let last_name = this.get('last_name');
    return first_name + " " + last_name;
  })

});
export default PersonCurrent;
