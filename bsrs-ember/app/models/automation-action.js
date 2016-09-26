import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation-action';
import { belongs_to } from 'bsrs-components/attr/belongs-to';

export default Model.extend(OptConf, {
  init() {
    belongs_to.bind(this)('type', 'automation-action');
    belongs_to.bind(this)('assignee', 'automation-action');
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
});
