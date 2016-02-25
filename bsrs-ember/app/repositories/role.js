import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE, run = Ember.run;
var ROLE_URL = PREFIX + '/admin/roles/';

var RoleRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'role'; }),
    typeGrid: Ember.computed(function() { return 'role-list'; }),
    garbage_collection: Ember.computed(function() { return ['role-list']; }),
    url: Ember.computed(function() { return ROLE_URL; }),
    uuid: injectUUID('uuid'),
    RoleDeserializer: inject('role'),
    deserializer: Ember.computed.alias('RoleDeserializer'),
    create(role_type, new_pk) {
        const store = this.get('store');
        const pk = this.get('uuid').v4();
        let role;
        run(() => {
            role = store.push('role', {id: pk, role_type: role_type, new: true, new_pk: new_pk});
        });
        return role;
    },
    update(model) {
        return PromiseMixin.xhr(ROLE_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())} ).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    fetch(id) {
        return this.get('store').find('role', id);
    },
    findById(id) {
        return PromiseMixin.xhr(ROLE_URL + id + '/', 'GET').then((response) => {
            return this.get('RoleDeserializer').deserialize(response, id);
        });
    },
    get_default() {
        return this.get('store').find('role');
    }
});

export default RoleRepo;
