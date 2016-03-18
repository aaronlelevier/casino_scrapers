import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend(TabMixin, EditMixin, {
  // init() {
  //   this._super(...arguments);
  //   this.set('keyErrorMsg', '');
  // },
  repository: inject('dtd'),
  tab() {
      let service = this.get('tabList');
      return service.findTab('dtd123');
  },
  actions: {
    save(update=true) {
      if (this.get('model.validations.attrs.key.isValid')) {
        const newModel = this.get('model').get('new');
        this._super(update);
        if(newModel){
          this.sendAction('editDTD');
        }
      } else {
        this.set('keyErrorMsg', this.get('model.validations.attrs.key.message'));
      }
    },
    setLinkType(new_link_type){
      this.get('model').set('link_type', new_link_type);
    }
  },
  keyIsInvalid: Ember.computed.alias('model.validations.attrs.key.isInvalid')
});
