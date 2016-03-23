import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import SortBy from 'bsrs-ember/mixins/sort-by';
import FilterBy from 'bsrs-ember/mixins/filter-by';
import UpdateFind from 'bsrs-ember/mixins/update-find';
import regex_property from 'bsrs-ember/utilities/regex-property';

const PAGE_SIZE = config.APP.PAGE_SIZE;

var SavingFilterComponent = Ember.Component.extend(SortBy, FilterBy, UpdateFind, {
  error: Ember.inject.service(),
  eventbus: Ember.inject.service(),
  _setup: Ember.on('init', function() {
    this.get('eventbus').subscribe('bsrs-ember@component:input-dynamic-filter:', this, 'onValueUpdated');
  }),
  _teardown: Ember.on('willDestroyElement', function() {
    this.get('eventbus').unsubscribe('bsrs-ember@component:input-dynamic-filter:');
  }),
  onValueUpdated(input, eventName, column, value) {
    this.set('find', this.update_find_query(column, value, this.get('find')));
  },
  logMsg: Ember.computed('error.message', function() {
    return this.get('error').get('message');
  }),
  actions: {
    toggleFilterModal(column) {
      this.toggle(column);
    },
    toggleSaveFilterSetModal() {
      this.toggleProperty('savingFilter');
    },
    invokeSaveFilterSet() {
      this.sendAction('save_filterset', this.get('filtersetName'));
      this.toggleProperty('savingFilter');
      this.set('filtersetName', '');
    },
  }
});

export default SavingFilterComponent;


