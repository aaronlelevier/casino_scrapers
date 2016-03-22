import Ember from 'ember';
const { run } = Ember;
import injectStore from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';

var DtdLinkComponent = Ember.Component.extend({
    store: injectStore('main'),
    uuid: injectUUID('uuid'),
    classNames: ['input-multi-dtd-field t-input-multi-dtd-field'],
    actions: {
        append(){
            const store = this.get('store');
            let id, m2m;
            run(() => {
                id = this.get('uuid').v4();
                const model = {id: id, new: true};
                m2m = this.get('model').add_field(model);
                const field = store.find('field', id);
                store.push('field', {id: id, type: field.get('typeDefault')});
                field.save();
            });
        },
        delete(field) {
            const fields = this.get('model').get('fields');
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

export default DtdLinkComponent;
