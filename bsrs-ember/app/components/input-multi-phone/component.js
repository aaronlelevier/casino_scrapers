import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';
import injectRepo from 'bsrs-ember/utilities/inject';

var InputMultiPhone = Ember.Component.extend({
  uuid: inject('uuid'),
  simpleStore: Ember.inject.service(),
  tagName: 'div',
  classNames: ['input-multi t-input-multi-phone'],
  fieldNames: 'number',
  phone_number_type_repo: injectRepo('phone-number-type'),
  phone_number_types: Ember.computed(function() {
    return this.get('simpleStore').find('phone-number-type');
  }),
  actions: {
    append() {
      const id = this.get('uuid').v4();
      const default_type = this.get('phone_number_type_repo').get_default();
      const type_id = default_type.get('id');
      var model = {id: id, phone_number_type_fk: type_id};
      run(() => {
        this.get('model').add_phonenumber(model);
      });
      const new_phonenumber = this.get('simpleStore').find('phonenumber', id);
      new_phonenumber.change_phone_number_type({ id: default_type.get('id') });
    },
    delete(entry) {
      run(() => {
        this.get('model').remove_phonenumber(entry.get('id'));
      });
    }
  }
});

export default InputMultiPhone;
