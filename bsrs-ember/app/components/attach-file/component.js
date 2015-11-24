import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
    repository: inject('attachment'),
    actions: {
        upload(e) {
            let files = e.target.files;
            let model = this.get('model');
            let repository = this.get('repository');
            if (files && files[0]) {
                repository.upload(files[0], model).then((file) => {
                    model.get('attachments').findBy('id', file.id).set('percent', 100);
                });
            }
        }
    }
});
