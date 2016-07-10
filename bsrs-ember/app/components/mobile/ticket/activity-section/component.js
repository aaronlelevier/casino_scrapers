import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  uuid: injectUUID('uuid'),
  repository: inject('attachment'),
  classNames: ['t-mobile-ticket-activity-section'],
  actions: {
    upload(e) {
      var repoUpload = (i, files) => {
        let uuid = this.get('uuid');
        let id = uuid.v4();
        let model = this.get('model');
        let repository = this.get('repository');
        repository.upload(id, files[i], model).then(() => {
          model.get('attachments').findBy('id', id).set('percent', 100);
        }).catch(() => {
          this.get('error').logErr('attachment.fail', 'ticket-comments-and-file-upload');
        });
      };
      let files = e.target.files;
      if (files && files[0]) {
        for (let i = 0; i < files.length; i++) {
          repoUpload(i, files);
        }
      }
    },
    save() {
      this.get('save')(true).then((activities) => {
        this.set('activities', activities);
      });
    },
  }
});
