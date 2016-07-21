import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectUuid from 'bsrs-ember/utilities/uuid';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

export default Ember.Component.extend(TabMixin, EditMixin, {
  uuid: injectUuid('uuid'),
  simpleStore: Ember.inject.service(),
  repository: injectRepo('profile'),
  personRepo: injectRepo('person'),
  actions: {
    save() {
      const model = this.get('model');
      if (this.get('model.validations.isValid')) {
        this._super(...arguments);
      }
      this.set('didValidate', true);
    },
    addFilter() {
      const id = this.get('uuid').v4();
      let model = this.get('model');
      let defaultPfilter = model.get('defaultPfilter');
      this.get('simpleStore').push('pfilter', {
        id: id,
        context: defaultPfilter.context,
        field: defaultPfilter.field,
        // not in CRUD, but needed for UI
        key: defaultPfilter.key
      });
      model.add_pf({id: id});
    },
    removeFilter(obj) {
      const id = obj.get('id');
      this.get('simpleStore').push('pfilter', {id: id, removed: true});
      this.get('model').remove_pf(id);
    }
  }
});