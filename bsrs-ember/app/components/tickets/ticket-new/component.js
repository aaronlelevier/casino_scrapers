import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import StrictMixin from 'bsrs-ember/mixins/validation/strict';

var TicketNewComponent = ParentValidationComponent.extend(StrictMixin, TabMixin, NewTabMixin, {
  init() {
    this._super(...arguments);
    this.didValidate = false;
  },
  personRepo: inject('person'),
  locationRepo: inject('location'),
  child_components: ['parent-model-category-select'],
  actions: {
    save() {
      this.set('submitted', true);
      if (this.all_components_valid()) {
        if (this.get('model.validations.isValid')) {
          const tab = this.tab();
          this.get('save')(tab);
        }
      }
      this.set('didValidate', true);
    }
  }
});

export default TicketNewComponent;
