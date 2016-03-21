import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend(TabMixin, EditMixin, {
  repository: inject('dtd'),
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
    setLinkType(type){
      this.get('model').set('link_type', type);
    },
    setNoteType(type) {
      this.get('model').set('note_type', type);
    },
  }
});
