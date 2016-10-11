import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/email';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  email: validator('format', { 
    type: 'email',
    message: 'errors.email.email' 
  }),
});

var EmailModel = Model.extend(Validations, OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('email_type', 'email');
  },
  simpleStore: Ember.inject.service(),
  email: attr(''),
  email_type_fk: undefined,
  // model_fk: undefined,
  invalid_email: Ember.computed('email', function() {
    let email = this.get('email');
    return typeof email === 'undefined' || email.trim() === '';
  }),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'emailTypeIsDirty', function() {
    return this.get('isDirty') || this.get('emailTypeIsDirty');
  }).readOnly(),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  saveRelated() {
    this.saveEmailType();
  },
  rollback() {
    this.rollbackEmailType();
    this._super(...arguments);
  },
  serialize() {
    return {
      id: this.get('id'),
      email: this.get('email'),
      type: this.get('email_type.id')
    };
  }
});

export default EmailModel;
