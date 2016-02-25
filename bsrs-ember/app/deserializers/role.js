import Ember from 'ember';
const { run } = Ember;

let extract_category = (model, store, role_existing) => {
    let server_sum_category_fks = [];
    let prevented_duplicate_m2m = [];
    let all_join_models = store.find('role-category', {role_fk: model.id});
    let categories = model.categories || [];
    let all_filtered_models = [];
    categories.forEach((category_json) => {
        let filtered_model = all_join_models.filter((m2m) => {
            return m2m.get('category_fk') === category_json.id;
        });
        if (filtered_model.length === 0) {
            let pk = Ember.uuid();
            server_sum_category_fks.push(pk);
            run(() => {
                store.push('role-category', {id: pk, role_fk: model.id, category_fk: category_json.id});
                store.push('category', category_json);
            });
        } else {
            prevented_duplicate_m2m.push(filtered_model[0].get('id'));
        }
    });
    server_sum_category_fks.push(...prevented_duplicate_m2m);
    let m2m_to_remove = all_join_models.filter((m2m) => {
        return Ember.$.inArray(m2m.get('id'), server_sum_category_fks) < 0 && m2m.get('role_fk') === model.id;
    });
    m2m_to_remove.forEach((m2m) => {
        store.push('role-category', {id: m2m.get('id'), removed: true});
    });
    delete model.categories;
    return server_sum_category_fks;
};

let extract_location_level = (model, store) => {
    const location_level_pk = model.location_level;
    const existing_location_level = store.find('location-level', location_level_pk);
    if (!location_level_pk) {
        const role = store.find('role', model.id);
        const llevel = role.get('location_level');
        if (role.get('location_level')) {
            store.push('role', {id: role.get('id'), location_level_fk: undefined});
            const location_level = role.get('location_level');
            const role_array = location_level.get('roles');
            const mutated_array = role_array.filter((role) => {
                return role !== model.id;
            });
            //TODO: test this in unit test
            if(llevel.get('isNotDirtyOrRelatedNotDirty')){
                store.push('location-level', {id: location_level.get('id'), roles: mutated_array});
                location_level.save();
            }
        }
        return undefined;
    }
    if(location_level_pk) {
        const location_level = store.find('location-level', location_level_pk);
        const existing_roles = location_level.get('roles') || [];
        if (location_level.get('content') && existing_roles.indexOf(model.id) === -1 && location_level.get('isNotDirtyOrRelatedNotDirty')) {
            store.push('location-level', {id: location_level.get('id'), roles: existing_roles.concat(model.id)});
            location_level.save();
        }
        delete model.location_level;
        model.location_level_fk = location_level_pk;
    }
    return location_level_pk;
};

var copySettingsToFirstLevel = (obj) => {
  var newState = {};
  var settings = obj.settings || {};

  for(var s in settings) {
    var setting = settings[s];
    var keys = Object.keys(setting);

    for(var i=0; i < keys.length; i++) {
      var key = keys[i];
      if(key === 'value') {
        newState[s] = obj.settings[s][key];
      } else {
        newState[s.concat('_'+key)] = obj.settings[s][key];
      }
    }
  }
  delete obj.settings;
  return Object.assign({}, obj, newState);
};

var RoleDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        let role_existing = store.find('role', id);
        if (!role_existing.get('id') || role_existing.get('isNotDirtyOrRelatedNotDirty')) {
            response.location_level_fk = extract_location_level(response, store);
            response.role_category_fks = extract_category(response, store, role_existing);
            response.detail = true;
            response = copySettingsToFirstLevel(response);
            const role = store.push('role', response);
            role.save();
        }
    },
    deserialize_list(response) {
        const store = this.get('store');
        response.results.forEach((model) => {
            // model.location_level_fk = extract_location_level(model, store);
            model.location_level_fk = model.location_level;
            delete model.location_level;
            store.push('role-list', model);
        });
    }
});

export default RoleDeserializer;
