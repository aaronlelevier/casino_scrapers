import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';

var TicketNewComponent = Ember.Component.extend(TabMixin, NewTabMixin, {
  init() {
    this._super(...arguments);
    this.didValidate = false;
  },
  personRepo: inject('person'),
  locationRepo: inject('location'),
  actions: {
    save() {
      if (this.get('model.validations.isValid')) {
        const tab = this.tab();
        this.get('save')(tab);
      }
      this.set('didValidate', true);
    }
  }
});

export default TicketNewComponent;
