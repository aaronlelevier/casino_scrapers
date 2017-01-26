import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import RoleMixin from 'bsrs-ember/mixins/model/person/role';
import OptConf from 'bsrs-ember/mixins/optconfigure/person';
import { belongs_to } from 'bsrs-components/attr/belongs-to';

export default Ember.Object.extend(RoleMixin, OptConf, {
  init() {
    belongs_to.bind(this)('role', 'person-list');
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  person: Ember.computed(function() {
    const store = this.get('simpleStore'); 
    return store.find('person', this.get('id'));
  }),
  isDirtyOrRelatedDirty: Ember.computed('person.isDirtyOrRelatedDirty', function() {
    return this.get('person').get('isDirtyOrRelatedDirty');
  }).readOnly(),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  fullname: Ember.computed('first_name', 'last_name', function() {
    const first_name = this.get('first_name');
    const last_name = this.get('last_name');
    return first_name + ' ' + last_name;
  }),
  status: Ember.computed(function() {
    const store = this.get('simpleStore');
    const person_status_list = store.find('general-status-list');
    return person_status_list.filter((ps) => {
      return Ember.$.inArray(this.get('id'), ps.get('people')) > -1; 
    }).objectAt(0);
  }),
  status_class: Ember.computed('status', function(){
    const name = this.get('status.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  photo: Ember.computed(function() {
    const store = this.get('simpleStore');
    const attachments = store.find('attachment');
    return attachments.findBy('id', this.get('photo_fk'));
  }),
}); 
