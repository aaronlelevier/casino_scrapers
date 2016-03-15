import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend(TabMixin, EditMixin, {
  repository: inject('dtd'),
  actions: {
    save(update=true) {
      // NOTE: (validate accross app w/ ember-cp-validations)
      // this.get('model').validateSync();
      // validations = this.get('model').get('links').forEach((link) => {link.validateSync()})
      // if (validations.get('isValied') {
      //   // do whatever we want
      // } else {
      //   // prevent transition
      // })

      //update prevents transition
      //this is for insert and update dtd methods and transitions to detail route
      const newModel = this.get('model').get('new');
      this._super(update);
      if(newModel){
        this.sendAction('editDTD');
      }
    }
  }
});
