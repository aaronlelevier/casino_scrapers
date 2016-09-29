import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

var AutomationSingle = Ember.Component.extend(TabMixin, {
  init() {
    this._super(...arguments);
    this.didValidate = false;
  },
  repository: injectRepo('automation'),
  saveTask: task(function * () {
    if (this.get('model.validations.isValid')) {
      const tab = this.tab();
      yield this.get('save')(tab);
    }
    this.set('didValidate', true);
  }),
  actions: {
    save() {
      this.get('saveTask').perform();
    },
    selectEvents(new_selection) {
      const model = this.get('model');
      const old_selection = model.get('event');
      const old_selection_ids = model.get('event_ids');
      const new_selection_ids = new_selection.mapBy('id');
      new_selection.forEach((new_model) => {
        if(!old_selection_ids.includes(new_model.id)) {
          model.add_event(new_model);
        }
      });
      old_selection.forEach((old_model) => {
        /* if new selection does not contain old id, then remove */
        if (!new_selection_ids.includes(old_model.get('id'))) {
          model.remove_event(old_model.get('id'));
        }
      });
    },
    fetchEvents() {
      this.get('repository').getEvents().then((response) => {
        this.set('options', response.results);
      });
    },
  }
});

export default AutomationSingle;
