import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend(TabMixin, EditMixin, {
  repository: inject('dtd'),
  attachmentRepository: inject('attachment'),
  uuid: injectUUID('uuid'),
  tab() {
    let service = this.get('tabList');
    return service.findTab('dtd123');
  },
  actions: {
    save(update=true) {
      if (this.get('model.validations.isValid')) {
        const newModel = this.get('model').get('new');
        this._super(update);
        if(newModel){
          this.sendAction('editDTD');
        }
      } else {
        this.get('model').set('saved', true);
        this.get('model.links').forEach((link) => {
          link.set('saved', true);
        });
      }
    },
    delete() {
      this._super(...arguments);
      this.tab().set('transitionCB', undefined);
    },
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
        const repository = this.get('attachmentRepository');
        repository.upload(id, files[i], model).then(() => {
          model.get('attachments').findBy('id', id).set('percent', 100);
        });
      };
      const files = e.target.files;
      for (let i = 0; i < files.length; i++) {
          repoUpload(i, files);
      }
    }
  }
});
