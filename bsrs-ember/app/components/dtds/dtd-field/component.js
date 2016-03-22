import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';

var DtdLinkComponent = Ember.Component.extend({
    uuid: inject('uuid'),
    classNames: ['input-multi-dtd-field t-input-multi-dtd-field'],
    actions: {
        append(){
            const id = this.get('uuid').v4();
            const model = {id: id, new: true};
            run(() => {
                this.get('model').add_field(model);
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
