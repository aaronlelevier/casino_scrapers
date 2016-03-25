import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';

var DtdLinkComponent = Ember.Component.extend({
    uuid: inject('uuid'),
    tagName: '',
    actions: {
        append(){
            const id = this.get('uuid').v4();
            const model = {id: id, new: true};
            run(() => {
                this.get('model').add_option(model);
            });
        },
        delete(option) {
            const options = this.get('model').get('options');
            run(() => {
                this.get('model').remove_option(option.get('id'));
            });
        }
    }
});

export default DtdLinkComponent;
