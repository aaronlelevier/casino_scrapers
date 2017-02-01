import Ember from 'ember';
import { Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OPT_CONF from 'dummy/mixins/user_status_config';

export default Model.extend(OPT_CONF, {
  simpleStore: Ember.inject.service(),
  init() {
    belongs_to.bind(this)('hat', 'user-status', {bootstrapped:true, 'change_func':false, 'save':false, 'rollback':false, 'belongs_to':false, 'dirty': false});
  },
  change_hat() {
    return 'wat';
  },
  belongs_to() {
    return 'wat';
  },
  save() {
    return 'wat';
  },
  rollback() {
    return 'wat';
  },
  dirty() {
    return 'wat';
  },
});
