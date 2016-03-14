import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';

var DtdLinkComponent = Ember.Component.extend({
    uuid: inject('uuid'),
    classNames: ['input-multi-dtd-link t-input-multi-dtd-link'],
    actions: {
        append(){
            const id = this.get('uuid').v4();
            const model = {id: id};
            run(() => {
                this.get('model').add_link(model);
            });
        }
    }
});

export default DtdLinkComponent;
