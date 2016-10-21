import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import OptConf from 'bsrs-ember/mixins/optconfigure/sendemail';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  subject: validator('presence', { 
    presence: true,
    message: 'errors.sendemail.subject' 
  }),
  body: validator('presence', {
    presence: true,
    message: 'errors.sendemail.body'
  }),
  recipient: validator('presence', {
    presence: true,
    message: 'errors.sendemail.recipient'
  }),
});

export default Model.extend(Validations, OptConf, {
  init() {
    this._super(...arguments);
    // TODO: change recipient to plural
    many_to_many.bind(this)('recipient', 'generic');
  },
  simpleStore: Ember.inject.service(),
  subject: attr(''),
  body: attr(''),
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
    this.save();
  }
});
