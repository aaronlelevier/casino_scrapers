import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import injectStore from 'bsrs-ember/utilities/store';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
const { Route, inject } = Ember;

var ApplicationRoute = Ember.Route.extend({
    repository: injectRepo('person'),
    RoleDeserializer: injectDeserializer('role'),
    store: injectStore('main'),
    translationsFetcher: inject.service(),
    i18n: inject.service(),
    tabList: inject.service(),
    beforeModel() {
        let store = this.get('store');
        const phone_number_config = Ember.$('[data-preload-phonenumber_types]').html();
        const phone_number_types = JSON.parse(phone_number_config);
        phone_number_types.forEach((model) => {
            store.push('phone-number-type', model);
        });
        const address_config = Ember.$('[data-preload-address_types]').html();
        const address_types = JSON.parse(address_config);
        address_types.forEach((model) => {
            store.push('address-type', model);
        });
        const country_config = Ember.$('[data-preload-countries]').html();
        const countries = JSON.parse(country_config);
        countries.forEach((model) => {
            store.push('country', model);
        });
        const state_config = Ember.$('[data-preload-states_us]').html();
        const state_list = JSON.parse(state_config);
        state_list.forEach((model) => {
            store.push('state', model);
        });
        const status_config = Ember.$('[data-preload-person-statuses]').html();
        const status_list = JSON.parse(status_config);
        status_list.forEach((model) => {
            store.push('status', model);
        });
        const loc_status_config = Ember.$('[data-preload-location-statuses]').html();
        const loc_status_list = JSON.parse(loc_status_config);
        loc_status_list.forEach((model) => {
            store.push('location-status', model);
        });
        const ticket_status_config = Ember.$('[data-preload-ticket-statuses]').html();
        let ticket_status_list = JSON.parse(ticket_status_config);
        ticket_status_list.forEach((model) => {
            store.push('ticket-status', model);
        });
        const ticket_priority_config = Ember.$('[data-preload-ticket-priorities]').html();
        const ticket_priority_list = JSON.parse(ticket_priority_config);
        ticket_priority_list.forEach((model) => {
            store.push('ticket-priority', model);
        });
        const currency_config = Ember.$('[data-preload-currencies]').html();
        const currency_list = JSON.parse(currency_config);
        for (let key in currency_list) {
            store.push('currency', currency_list[key]);
        }
        const location_level_config = Ember.$('[data-preload-location-levels]').html();
        const location_level_list = JSON.parse(location_level_config);
        location_level_list.forEach((model) => {
            model.children_fks = model.children || [];
            delete model.children;
            store.push('location-level', model);
        });
        const role_config = Ember.$('[data-preload-roles]').html();
        const role_list = JSON.parse(role_config);
        const role_deserializer = this.get('RoleDeserializer');
        role_list.forEach((model) => {
            role_deserializer.deserialize(model, model.id);
            if (model.location_level) {
                let loc_level = store.find('location-level', model.location_level);
                let existing_roles = loc_level.get('roles') || [];
                loc_level.set('roles', existing_roles.concat([model.id]));
                loc_level.save();
                delete model.location_level;
            }
            store.push('role', model);
        });
        const role_types_config = Ember.$('[data-preload-role-types]').html();
        const role_type_list = JSON.parse(role_types_config);
        role_type_list.forEach((model, index) => {
            store.push('role-type', {id: index+1, name: model});
        });

        const filterset_config = Ember.$('[data-preload-saved-filterset]').html();
        const filterset_list = JSON.parse(filterset_config);
        filterset_list.forEach(filterset => {
            store.push('filterset', filterset);
        });

        const model_default_order_config = Ember.$('[data-preload-default-model-ordering]').html();
        const model_default_order_definitions = JSON.parse(model_default_order_config);
        Object.keys(model_default_order_definitions).forEach(function(key) {
            let order = model_default_order_definitions[key];
            store.push('model-ordering', {id: key, order: order});
        });

        const locale_config = Ember.$('[data-preload-locales]').html();
        const locale_list = JSON.parse(locale_config);

        locale_list.forEach((model, index) => {
            store.push('locale', model);
        });

        const person_current_config = Ember.$('[data-preload-person-current]').html();
        const person_current = JSON.parse(person_current_config);

        const person_current_role = store.find('role', person_current.role);
        person_current_role.set('people', [person_current.id]);
        //save so not dirty
        person_current_role.save();

        let current_locale = store.find('locale', person_current.locale);
        config.i18n.currentLocale = current_locale.get('locale');

        store.push('person-current', person_current);
        store.push('person', {
            id: person_current.id,
            first_name: person_current.first_name,
            last_name: person_current.last_name,
            username: person_current.username,
            title: person_current.title,
            role_fk: person_current.role,
            locale: current_locale.get('locale')
        });

        return this.get('translationsFetcher').fetch();

    },
    setupController(controller, hash) {
        controller.set('tabs', this.get('store').find('tab'));
    },
    afterModel(){
        this.set('i18n.locale', config.i18n.currentLocale);
    },
    actions: {
        cancel_modal() {
            Ember.$('.t-modal').modal('hide');
        },
        closeTabMaster(tab){
            let model = this.get('store').find(tab.get('doc_type'), tab.get('id'));
            if (model && model.get('isDirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTabModel = tab;
                this.trx.attemptedTransitionModel = model;
                this.trx.attemptedAction = 'closeTabMaster';
            } else {
                Ember.$('.t-modal').modal('hide');
                let temp = this.router.generate(this.controller.currentPath);
                temp = temp.split('/').pop();
                if(temp === tab.get('id') || tab.get('newModel')){
                    this.transitionTo(tab.get('redirect'));
                    if (tab.get('newModel') && !tab.get('saveModel')) {
                        model.removeRecord(); 
                    }
                }else if(this.controller.currentPath !== tab.get('redirect')){
                    this.transitionTo(this.controller.currentPath);
                }else if(typeof tab.get('redirect') !== undefined){
                    this.transitionTo(tab.get('redirect'));
                }
                this.get('tabList').closeTab(model.get('id'));
            }
        },
        deleteAndCloseTabMaster(tab, repository) {
            let model = this.get('store').find(tab.get('doc_type'), tab.get('id'));
            this.send('closeTabMaster', tab);
            repository.delete(model.get('id'));
        }
    }
});

export default ApplicationRoute;
