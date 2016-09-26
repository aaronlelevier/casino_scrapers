import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';
import injectRepo from 'bsrs-ember/utilities/inject';

var InputMultiEmail = Ember.Component.extend({
  uuid: inject('uuid'),
  simpleStore: Ember.inject.service(),
  tagName: 'div',
  classNames: ['input-multi t-input-multi-email'],
  fieldNames: 'email',
  email_type_repo: injectRepo('email-type'),
  email_types: Ember.computed(function() {
    return this.get('simpleStore').find('email-type');
  }),
  actions: {
    append() {
      const id = this.get('uuid').v4();
      const default_type = this.get('email_type_repo').get_default();
      const type_id = default_type.get('id');
      var model = {id: id, email_type_fk: type_id};
      run(() => {
        this.get('model').add_email(model);
      });
      const new_email = this.get('simpleStore').find('email', id);
      new_email.change_email_type({ id: default_type.get('id') });
    },
  }
});

export default InputMultiEmail;
