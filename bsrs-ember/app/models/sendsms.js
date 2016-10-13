import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import OptConf from 'bsrs-ember/mixins/optconfigure/sendsms';
import { many_to_many } from 'bsrs-components/attr/many-to-many';


export default Model.extend(OptConf, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('recipient', 'sendsms');
  },
  simpleStore: Ember.inject.service(),
  message: attr(''),
  isDirtyOrRelatedDirty: Ember.computed('recipientIsDirty', function() {
    return this.get('isDirty') || this.get('recipientIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackRecipient();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveRecipient();
  }
});
