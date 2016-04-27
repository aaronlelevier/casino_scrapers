import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';
import injectStore from 'bsrs-ember/utilities/store';

export default Ember.Component.extend(TabMixin, EditMixin, {
  didValidate: false,
  store: injectStore('main'),
  error: Ember.inject.service(),
  repository: inject('dtd'),
  attachmentRepository: inject('attachment'),
  uuid: injectUUID('uuid'),
  attachmentErrMsg: Ember.computed('error.message.dtd-single.msg', function() {
    return this.get('error').getMsg('dtd-single');
  }),
  tabList: Ember.inject.service(),
  actions: {
    save(update=true) {
      const model = this.get('model');
      if (this.get('model.validations.isValid')) {
        const newModel = this.get('model').get('new');
        this._super(update);
        if(newModel){
          this.sendAction('editDTD');
        }
      }
      this.set('didValidate', true);
    },
    //delete() {
    //  this._super(...arguments);
    //  //Continue on w/ transition
    //  //TODO: abstract to service
    //  this.tab().set('transitionCB', undefined);
    //},
    setLinkType(type){
      this.get('model').set('link_type', type);
    },
    setNoteType(type) {
      this.get('model').set('note_type', type);
    },
    upload(e) {
      const repoUpload = (i, files) => {
        const uuid = this.get('uuid');
        const id = uuid.v4();
        const model = this.get('model');
        const store = this.get('store');
        const repository = this.get('attachmentRepository');
        repository.upload(id, files[i], model).then((attachment) => {
          model.get('attachments').findBy('id', id).set('percent', 100);
          const current_dtd_attachments_fks = model.get('dtd_attachments_fks');
          const updated_dtd_attachment_fks = current_dtd_attachments_fks.concat(attachment.id).uniq();
          store.push('dtd', {id: model.get('id'), dtd_attachments_fks: updated_dtd_attachment_fks});
          store.push('attachment', attachment);
        }).catch(() => {
          this.get('error').logErr('attachment.fail', 'dtd-single');
        });
      };
      const files = e.target.files;
      if (files && files[0]) {
        for (let i = 0; i < files.length; i++) {
          repoUpload(i, files);
        }
      }
    },
    removeAttachment(attachment_id) {
      const model = this.get('model');
      const repository = this.get('attachmentRepository');
      const tab = this.get('tabList').findTab(model.get('id'));
      const callback = function() {
        model.remove_attachment(attachment_id);
        repository.remove(attachment_id);
      };
      this.sendAction('deleteAttachment', tab, callback);
    },
  }
});
