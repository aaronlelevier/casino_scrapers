import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
    uuid: injectUUID('uuid'),
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
            var repoUpload = (i, files) => {
                let uuid = this.get('uuid');
                let id = uuid.v4();
                let model = this.get('model');
                let repository = this.get('repository');
                repository.upload(id, files[i], model).then(() => {
                    model.get('attachments').findBy('id', id).set('percent', 100);
                });
            };
            let files = e.target.files;
            if (files && files[0]) {
                for (let i = 0; i < files.length; i++) {
                    repoUpload(i, files);
                }
            }
        },
        repoUpload(i, files) {
        }
    }
});
