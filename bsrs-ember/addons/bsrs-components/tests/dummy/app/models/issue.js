import Ember from 'ember';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OPT_CONF from 'dummy/mixins/issue_config';

export default Ember.Object.extend(OPT_CONF, {
  init() {
    belongs_to.bind(this)('tag', 'issue', {bootstrapped: true});
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
});
