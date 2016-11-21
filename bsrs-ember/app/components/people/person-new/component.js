import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';//used for save method that returns a promise and transition to detail

var PersonNewComponent = Ember.Component.extend(TabMixin, NewTabMixin, {
  repository: inject('person'),
  locale_repo: inject('locale'),
  selectedLocale: Ember.computed('model.locale', function() {
    return this.get('model.locale') ? this.get('model.locale') : this.get('locale_repo').get_default();
  }),
  actions: {
    save() {
      if (this.get('model.validations.isValid')) {
        this._super(...arguments).then(() => {
          this.sendAction('editPerson');
        });
      }
    }
  }
});

export default PersonNewComponent;
