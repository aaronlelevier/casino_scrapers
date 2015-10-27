import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var ParentTicketCategorySelectComponent = Ember.Component.extend({
    repository: inject('category'),
    actions: {
        selected_category(category_pk) {
            this.get('repository').findById(category_pk);
        }
    }
});

export default ParentTicketCategorySelectComponent;
