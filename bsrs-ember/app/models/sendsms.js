import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import OptConf from 'bsrs-ember/mixins/optconfigure/sendsms';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  message: validator('length', { 
    min: 1,
    max: 160,
    message: 'errors.sendsms.message' 
  }),
  recipient: validator('presence', {
    presence: true,
    message: 'errors.sendsms.recipient'
  }),
});


export default Model.extend(Validations, OptConf, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('recipient', 'generic');
  },
  simpleStore: Ember.inject.service(),
  message: attr(''),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'recipientIsDirty', function() {
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
