import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import { validate } from 'ember-cli-simple-validation/mixins/validate';

var PersonSingle = ParentValidationComponent.extend({
    child_components: ['input-multi-phone', 'input-multi-address'],
    repository: inject('person'),
    location_repo: inject('location'),
    store: injectStore('main'),
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    usernameValidation: validate('model.username'),
    //TODO: Need to remove this observer and move it into a service.
    initTab: Ember.observer('model.address_fks', function(){
      this.get('store').push('tab', {
          id: this.get('model.id'),
          doc_type: 'person',
          doc_route: 'admin.people.person'
      });
    }),
    actions: {
        savePerson() {
            this.set('submitted', true);
            if (this.all_components_valid()) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('savePerson');
                });
            }
        },
        cancelPerson() {
            this.sendAction('cancelPerson');
        },
        deletePerson() {
            var model = this.get('model');
            var repository = this.get('repository');
            repository.delete(model.get('id'));
            this.sendAction('redirectUser');
        }
    }
});

export default PersonSingle;
