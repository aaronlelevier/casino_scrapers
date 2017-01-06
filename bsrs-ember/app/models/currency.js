import Ember from 'ember';
const { set, get } = Ember;
import { Model } from 'ember-cli-simple-store/model';

export default Model.extend({
  init() {
    this._super(...arguments);
    set(this, 'workOrder', get(this, 'workOrder') || []);
  }
});
