import Ember from 'ember';
const { run } = Ember;
import injectUUID from 'bsrs-ember/utilities/uuid';

var DtdFieldComponent = Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  uuid: injectUUID('uuid'),
  classNames: ['input-multi-dtd-field t-input-multi-dtd-field'],
  actions: {
    append(){
      const store = this.get('simpleStore');
      const model = this.get('model');
      const fields_length = model.get('fields.length');
      const id = this.get('uuid').v4();
      const obj = {id: id, new: true, order: fields_length};
      model.add_field(obj);
      const field = store.find('field', id);
      run(() => {
        store.push('field', {id: id, type: field.get('typeDefault')});
        field.save();
      });
    },
    delete(field) {
      run(() => {
        this.get('model').remove_field(field.get('id'));
      });
    },
    setFieldType(field_id, type) {
      const fields = this.get('model').get('fields');
      fields.forEach(field => {
        if (field.get('id') === field_id) {
          field.set('type', type);
        }
      });
    }
  }
});

export default DtdFieldComponent;
