import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
    repository: inject('attachment'),
    actions: {
        removeAttachment(attachment_id) {
            let model = this.get('model');
            let repository = this.get('repository');
            if (window.confirm('Are you sure you want to delete this attachment?')) {
                model.remove_attachment(attachment_id);
                repository.remove(attachment_id);
            }
        },
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
