import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
  tabList: Ember.inject.service(),
  tagName: 'div',
  classNames: ['col-md-12'],
  uuid: injectUUID('uuid'),
  repository: inject('attachment'),
  error: Ember.inject.service(),
  attachmentErrMsg: Ember.computed('error.message.ticket-comments-and-file-upload.msg', function() {
    return this.get('error').getMsg('ticket-comments-and-file-upload');
  }),
  actions: {
    removeAttachment(attachment_id) {
      const model = this.get('model');
      const repository = this.get('repository');
      const tab = this.get('tabList').findTab(model.get('id'));
      const callback = function() {
        model.remove_attachment(attachment_id);
        repository.remove(attachment_id);
      };
      this.sendAction('deleteAttachment', tab, callback);
    },
    upload(e) {
      var repoUpload = (i, files) => {
        let uuid = this.get('uuid');
        let id = uuid.v4();
        let model = this.get('model');
        let repository = this.get('repository');
        repository.upload(id, files[i], model).then(() => {
          model.add_attachment({ id: id });
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
    }
  }
});
