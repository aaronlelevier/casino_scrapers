import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';//used for save method that returns a promise and transition to detail

var PersonNewComponent = Ember.Component.extend(TabMixin, NewTabMixin, {
  didValidate: false,
  repository: inject('person'),
  simpleStore: Ember.inject.service(),
  selectedLocale: Ember.computed('model.locale', function() {
    return this.get('model.locale') ? this.get('model.locale') : this.get('simpleStore').find('locale', {default: true}).objectAt(0);
  }),
  actions: {
    save() {
      if (this.get('model.validations.isValid')) {
        this._super().then(() => {
          this.sendAction('editPerson');
        });
      }
      this.set('didValidate', true);
    }
  }
});

export default PersonNewComponent;
