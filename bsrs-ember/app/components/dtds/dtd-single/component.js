import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend(TabMixin, EditMixin, {
  repository: inject('dtd'),
  actions: {
    save(update=true) {
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
