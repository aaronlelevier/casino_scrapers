import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';

var CategoryNewRoute = Ember.Route.extend({
    repository: inject('category'),
    uuid: injectUUID('uuid'),
    tabList: Ember.inject.service(),
    queryParams: {
        search: {
            refreshModel: true
        },
    },
    model() {
        let transition = arguments[1];
        let search = transition.queryParams.search;
        let categories_children = this.get('repository').findCategoryChildren(search) || [];
        let pk = this.get('uuid').v4();
        let model = this.get('store').push('category', {id: pk, new: true});
        this.get('tabList').createTab(this.routeName, 'category', pk, 'admin.categories.index', true);
        return Ember.RSVP.hash({
            model: model,
            categories_children: categories_children,
            search: search
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('categories_children', hash.categories_children);
        controller.set('search', hash.search);
    },
    actions: {
        redirectUser() {
           this.transitionTo('admin.categories');
        }
    }
});

export default CategoryNewRoute;
