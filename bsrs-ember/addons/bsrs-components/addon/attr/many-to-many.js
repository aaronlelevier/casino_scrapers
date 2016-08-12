import Ember from 'ember';
const { run } = Ember;
import equal from 'bsrs-components/utils/equal';
import camel from 'bsrs-components/utils/camel';
import caps from 'bsrs-components/utils/caps';
import pluralize from 'bsrs-components/utils/plural';


/**
 * Creates properties defined on join  model
 *   - relationship param defines model association
 *   - models must be explicitly overridden here and can't override in main model given init setup
 *
 * @method many_to_many
 * @param {string} _associatedModel owning model ie. hat
 * @param {string} modelName belongs to model ie. user
 * @param {object} noSetup explicitly defines what methods to override in model
 * @return list of defined properties/methods/computed to handle many_to_many relationship with parent
 */
var many_to_many = function(_associatedModel, modelName, noSetup) {
  let { plural=false, add_func=true, remove_func=true, rollback=true, save=true, dirty=true, unlessAddedM2MDirty=false } = noSetup || {};
  const _singularName = _associatedModel;
  if (plural) {
    _associatedModel = pluralize(_associatedModel);
  }
  const _capsOwnerName = caps(_associatedModel);
  const _camelOwnerName = camel(_associatedModel);
  const _joinModelName = `${modelName}_${_associatedModel}`;

  //many_to_many
  Ember.defineProperty(this, `${_joinModelName}`, many_to_many_generator(modelName, _associatedModel));
  Ember.defineProperty(this, `${_joinModelName}_ids`, many_to_many_ids(_joinModelName));
  Ember.defineProperty(this, `${_associatedModel}`, many_models(_joinModelName, _associatedModel));
  Ember.defineProperty(this, `${_associatedModel}_ids`, many_models_ids(_associatedModel));

  //add
  if (add_func) {
    Ember.defineProperty(this, `add_${_singularName}`, undefined, add_many_to_many(_associatedModel, _joinModelName, modelName));
  }
  //remove
  if (remove_func) {
    Ember.defineProperty(this, `remove_${_singularName}`, undefined, remove_many_to_many(_associatedModel, _joinModelName));
  }

  //dirty
  if (dirty && !unlessAddedM2MDirty) {
    Ember.defineProperty(this, `${_camelOwnerName}IsDirty`, many_to_many_dirty(_joinModelName));
    Ember.defineProperty(this, `${_camelOwnerName}IsNotDirty`, Ember.computed.not(`${_associatedModel}IsDirty`));
  } else if (unlessAddedM2MDirty) {
    Ember.defineProperty(this, `${_camelOwnerName}IsDirty`, many_to_many_dirty_unlessAddedM2M(_joinModelName));
    Ember.defineProperty(this, `${_camelOwnerName}IsNotDirty`, Ember.computed.not(`${_associatedModel}IsDirty`));
  }

  //rollback
  if (rollback) {
    Ember.defineProperty(this, `rollback${_capsOwnerName}`, undefined, many_to_many_rollback(_associatedModel, _joinModelName, modelName));
  }

  //save
  if (save) {
    Ember.defineProperty(this, `save${_capsOwnerName}`, undefined, many_to_many_save(_joinModelName, _associatedModel, modelName));
  }
};


/**
 * Creates belongs to relationship for model attrs.
 *   - OPT_CONF is defined as a mixin in the relationship model
 *   - Ember.get('shoes', 'users')
 *   - store.find('shoes', filter)
 *
 * @method many_to_many_generator
 * @return {Store.ArrayProxy}
 */
var many_to_many_generator = function(modelName, _associatedModel) {
  return Ember.computed(function() {
    const filter = (m2m) => {
      return m2m.get(`${modelName}_pk`) === this.get('id') && !m2m.get('removed');
    };
    return this.get('simpleStore').find(this.OPT_CONF[_associatedModel]['join_model'], filter);
  });
};


/**
 * Creates array of ids used for dirty tracking.  Updated as you add / remove many to many model
 *
 * @method many_to_many_ids
 * @return {Array}
 */
var many_to_many_ids = function(_joinModelName) {
  return Ember.computed(`${_joinModelName}.[]`, function() {
    return this.get(`${_joinModelName}`).mapBy('id');
  });
};


/**
 * Returns model instances associated with mainModel
 * - associated_model is the store model name to find pk that join model points at
 *
 * @method many_models
 * @return {Store.ArrayProxy}
 */
var many_models = function(_joinModelName, _associatedModel) {
  return Ember.computed(`${_joinModelName}.[]`, function() {
    const many_relateds = this.get(_joinModelName);
    const relatedModelName = this.OPT_CONF[_associatedModel]['associated_model'];
    const lookup_pk = this.OPT_CONF[_associatedModel]['associated_pointer'] || this.OPT_CONF[_associatedModel]['associated_model'];
    const filter = function(many_related) {
      const many_related_pks = this.mapBy(`${lookup_pk}_pk`);
      return many_related_pks.includes(many_related.get('id'));
    };
    return this.get('simpleStore').find(relatedModelName, filter.bind(many_relateds));
  });
};


/**
 * Creates array of ids used for random cases when need all ids that main model is associated with
 *
 * @method many_models_ids
 * @return {Array}
 */
var many_models_ids = function(_associatedModel) {
  return Ember.computed(`${_associatedModel}.[]`, function() {
    return this.get(_associatedModel).mapBy('id');
  });
};


/**
 * Dirty tracking
 * - compares length and equality of join model ids and fks
 * - fks are created on deserialization
 *
 * @method many_to_many_dirty
 * @return {boolean}
 */
var many_to_many_dirty = function(_joinModelName) {
  const m2m_ids = `${_joinModelName}_ids`;
  const m2m_fks = `${_joinModelName}_fks`;
  return Ember.computed(`${m2m_ids}.[]`, `${m2m_fks}.[]`, function() {
    const many_relateds_ids = this.get(m2m_ids);
    const previous_m2m_fks = this.get(m2m_fks) || [];
    return equal(many_relateds_ids, previous_m2m_fks) ? false : true;
  });
};


/**
 * Dirty tracking for models that are not dirty if add w/o filling in properties
 * - used for items that you can add dynamically but don't want to dirty the model if you don't fill out any properties of the associated model
 *
 * @method many_to_many_dirty_unlessAddedM2M
 * @return {boolean}
 */
var many_to_many_dirty_unlessAddedM2M = function(_joinModelName) {
  const m2m_ids = `${_joinModelName}_ids`;
  const m2m_fks = `${_joinModelName}_fks`;
  return Ember.computed(m2m_ids, `${m2m_fks}.[]`, function() {
    const many_relateds_ids = this.get(m2m_ids);
    const previous_m2m_fks = this.get(m2m_fks) || [];
    if(many_relateds_ids.length < previous_m2m_fks.length) {
      return true;
    } else if (many_relateds_ids.length > previous_m2m_fks.length) {
      return false;
    }
    return equal(many_relateds_ids, previous_m2m_fks) ? false : true;
  });
};


/**
 * Rollback
 * -
 *
 * @method many_to_many_rollback
 * @return {boolean}
 */
var many_to_many_rollback = function(_associatedModel, _joinModelName, modelName) {
  return function() {
    const join_model = this.OPT_CONF[_associatedModel]['join_model'];
    const join_model_fks = `${_joinModelName}_fks`;
    const main_many_fk = `${modelName}_pk`;
    const store = this.get('simpleStore');
    const previous_m2m_fks = this.get(join_model_fks) || [];
    const m2m_array = store.find(join_model).toArray();
    const m2m_to_throw_out = m2m_array.filter((m2m) => {
      return !previous_m2m_fks.includes(m2m.get('id')) && !m2m.get('removed') && this.get('id') === m2m.get(main_many_fk);
    });
    run(() => {
      m2m_to_throw_out.forEach((m2m) => {
        run(() => {
          store.push(join_model, {id: m2m.get('id'), removed: true});
        });
      });
      previous_m2m_fks.forEach((pk) => {
        var m2m_to_keep = store.find(join_model, pk);
        if (m2m_to_keep.get('id')) {
          run(() => {
            store.push(join_model, {id: pk, removed: undefined});
          });
        }
      });
    });
  };
};


/**
 * Save
 * - main model might be defined in order to allow for mixins, which might use a `model_pk` but you want that model associated with a ticket model and a category model.
 *
 * @method many_to_many_save
 * @return {function}
 */
var many_to_many_save = function(_joinModelName, _associatedModel, modelName) {
  return function() {
    //TODO: test main_model
    const model_name = this.OPT_CONF[_associatedModel]['main_model'] || modelName;
    const m2m_models = _joinModelName;
    const m2m_models_ids = `${_joinModelName}_ids`;
    const m2m_models_fks = `${_joinModelName}_fks`;
    const id = this.get('id');
    const many_relateds = this.get(m2m_models);
    const many_relateds_ids = this.get(m2m_models_ids) || [];
    const previous_m2m_fks = this.get(m2m_models_fks) || [];
    //add
    let updated_m2m_fks = previous_m2m_fks;
    many_relateds.forEach((join_model) => {
      if(!previous_m2m_fks.includes(join_model.get('id'))) {
        run(() => {
          updated_m2m_fks = updated_m2m_fks.concat(join_model.get('id'));
          let new_model;
          run(() => {
            new_model = this.get('simpleStore').push(model_name, {id: id, m2m_models_fks: updated_m2m_fks});
          });
          new_model.set(m2m_models_fks, updated_m2m_fks);
        });
      }
    });
    const updated_previous_m2m_fks = this.get(m2m_models_fks);
    //remove
    for (let i=previous_m2m_fks.length-1; i>=0; --i) {
      if (!many_relateds_ids.includes(previous_m2m_fks[i])) {
        updated_previous_m2m_fks.removeObject(previous_m2m_fks[i]);
      }
    }
  };
};

/**
 * Add
 * - associated_pointer is defined in the config file.  Might be different than the associated model.  Ie associated model might be location but since the associated
 *   model is an instance of the main model (location), then you will want the pointer to that associated model to be called something different
 *
 * @method add_many_to_many
 * @return {function}
 */
var add_many_to_many = function(_associatedModel, _joinModelName, modelName) {
  return function(many_related) {
    const relatedModelName = this.OPT_CONF[_associatedModel]['associated_model'];
    const lookup_pk = this.OPT_CONF[_associatedModel]['associated_pointer'] || this.OPT_CONF[_associatedModel]['associated_model'];
    const many_fk = `${lookup_pk}_pk`;
    const main_many_fk = `${modelName}_pk`;
    const join_model = this.OPT_CONF[_associatedModel]['join_model'];
    const store = this.get('simpleStore');
    let new_many_related = store.find(relatedModelName, many_related.id);
    if(!new_many_related.get('content') || new_many_related.get('isNotDirtyOrRelatedNotDirty')){
      run(() => {
        new_many_related = store.push(relatedModelName, many_related);
        /* jshint ignore:start */
        // new_many_related might be an Ember object
        new_many_related.save && new_many_related.save();
        /* jshint ignore:end */
      });
    }
    const many_related_pk = new_many_related.get('id');
    //check for existing
    const existing_join = store.find(join_model).toArray();
    let existing = existing_join.filter((m2m) => {
      return m2m.get(many_fk) === many_related_pk && m2m.get(main_many_fk) === this.get('id');
    }).objectAt(0);
    const new_join_model = {id: Ember.uuid()};
    new_join_model[main_many_fk] = this.get('id');
    new_join_model[many_fk] = many_related_pk;
    let new_model;
    run(() => {
      if(existing){
        new_model = store.push(join_model, {id: existing.get('id'), removed: undefined});
      } else{
        new_model = store.push(join_model, new_join_model);
      }
    });
    return new_model;
  };
};


/**
 * Remove
 * - associated_pointer is defined in the config file.  Might be different than the associated model.  Ie associated model might be location but since the associated
 *   model is an instance of the main model (location), then you will want the pointer to that associated model to be called something different
 *
 * @method remove_many_to_many
 * @return {function}
 */
var remove_many_to_many = function(_associatedModel, _joinModelName) {
  return function(many_related_pk) {
    const store = this.get('simpleStore');
    //TODO: test associated_pointer config
    const lookup_pk = this.OPT_CONF[_associatedModel]['associated_pointer'] || this.OPT_CONF[_associatedModel]['associated_model'];
    const m2m_pk = this.get(_joinModelName).filter((m2m) => {
      return m2m.get(`${lookup_pk}_pk`) === many_related_pk;
    }).objectAt(0).get('id');
    run(() => {
      store.push(this.OPT_CONF[_associatedModel]['join_model'], {id: m2m_pk, removed: true});
    });
  };
};

export { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_dirty_unlessAddedM2M, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids };
