import Ember from 'ember';
const { run } = Ember;
import camel from 'bsrs-components/utils/camel';
import caps from 'bsrs-components/utils/caps';


/**
 * Creates properties defined on owning model
 *   - relationship param defines model association
 *   - models must be explicitly overridden here and can't override in main model given init setup
 *
 * @method belongs_to
 * @param {string} _ownerName owning model ie. hat
 * @param {string} modelName belongs to model ie. user
 * @param {object} noSetup explicitly defines what methods to override in model
 * @return list of defined properties/methods/computed to handle belongs_to relationship with parent
 */
var belongs_to = function(_ownerName, modelName, noSetup) {
  let { bootstrapped=false, change_func=true, belongs_to=true, rollback=true, save=true, dirty=true, track_related_model=false } = noSetup || {};
  const _capsOwnerName = caps(_ownerName);
  const _camelOwnerName = camel(_ownerName);

  //belongs_to
  if(belongs_to){
    Ember.defineProperty(this, `${_ownerName}s`, belongs_to_generator(_ownerName));
    Ember.defineProperty(this, _ownerName, Ember.computed.alias(`${_ownerName}s.firstObject`));
  }

  //change
  if(change_func){
    Ember.defineProperty(this, `change_${_ownerName}`, undefined, change_belongs_to(_ownerName));
  }

  //dirty
  if(dirty){
    Ember.defineProperty(this, `${_camelOwnerName}IsDirty`, belongs_to_dirty(_ownerName));
    Ember.defineProperty(this, `${_camelOwnerName}IsNotDirty`, Ember.computed.not(`${_ownerName}IsDirty`));
  } else if(!dirty && track_related_model){
    Ember.defineProperty(this, `${_camelOwnerName}IsDirty`, belongs_to_track_related_model(_ownerName));
    Ember.defineProperty(this, `${_camelOwnerName}IsNotDirty`, Ember.computed.not(`${_ownerName}IsDirty`));
  }

  //rollback
  if(rollback && bootstrapped){
    Ember.defineProperty(this, `rollback${_capsOwnerName}`, undefined, belongs_to_rollback(_ownerName));
  } else if (rollback){
    Ember.defineProperty(this, `rollback${_capsOwnerName}`, undefined, belongs_to_rollback_simple(_ownerName));
  }
  //save
  if(save){
    Ember.defineProperty(this, `save${_capsOwnerName}`, undefined, belongs_to_save(modelName, _ownerName));
  }
};


/**
 * Creates belongs to relationship for model attrs.
 *   - relationship param defines model association
 *   - OPT_CONF is defined as a mixin in the relationship model
 *   - Ember.get('hat', 'users')
 *   - store.find('hat', filter)
 *
 * @method belongs_to_generator
 * @return {Store.ArrayProxy}
 */
var belongs_to_generator = function(_ownerName) {
  return Ember.computed(function() {
    const id = this.get('id');
    const filter = (related) => {
      const many = Ember.get(related, this.OPT_CONF[_ownerName]['collection']);
      return many && many.includes(id);
    };
    return this.get('simpleStore').find(this.OPT_CONF[_ownerName]['property'], filter);
  }).property().readOnly();
};

/**
 * Creates change_belongs_to method
 *   - use if data is not bootstrapped
 *   - need this method to setup model in store
 *
 * @method change_belongs_to
 * @param {object}
 * @return func
 */
var change_belongs_to = function(_ownerName) {
  return function(new_related) {
    const collection = this.OPT_CONF[_ownerName]['collection'];
    const name = this.OPT_CONF[_ownerName]['property'];
    const this_related_model = this.OPT_CONF[_ownerName]['related_model'];
    const store = this.get('simpleStore');
    let push_related;
    if(new_related && typeof new_related === 'object'){
      //push in js object
      push_related = store.find(this.OPT_CONF[_ownerName]['property'], new_related.id);
      if(!push_related.get('content') || push_related.get('isNotDirtyOrRelatedNotDirty')){
        run(() => {
          let push_related = store.push(this.OPT_CONF[_ownerName]['property'], new_related);
          push_related.save();
        });
      }
    }
    const related = this_related_model || name.replace('-', '_');
    const current_related = this.get(related);
    if(current_related) {
      //filter out calling id from array if null.  Needs to happen before adding back
      const current_related_existing = current_related.get(collection);
      const updated_current_related_existing = current_related_existing.filter((id) => {
        return id !== this.get('id');
      });
      const current_related_pojo = {id: current_related.get('id')};
      current_related_pojo[collection] = updated_current_related_existing;
      run(() => {
        store.push(this.OPT_CONF[_ownerName]['property'], current_related_pojo);
      });
    }
    if (new_related && typeof new_related === 'object') {
      //push calling id back in array
      const related_collection = push_related.get(collection) || [];
      const new_related_pojo = {id: push_related.get('id')};
      new_related_pojo[collection] = related_collection.concat(this.get('id'));
      run(() => {
        store.push(this.OPT_CONF[_ownerName]['property'], new_related_pojo);
      });
    } else if (typeof new_related !== 'object') { //may be # or string
      let new_related_obj = store.find(this.OPT_CONF[_ownerName]['property'], new_related);
      const new_related_existing = new_related_obj.get(collection) || [];
      run(() => {
        store.push(this.OPT_CONF[_ownerName]['property'], { id: new_related_obj.get('id'), [collection]: new_related_existing.concat(this.get('id')) });
      });
    }
  };
};


/**
 * Creates belongs_to_dirty method
 *
 * @method belongs_to_dirty
 * @return {Ember.Computed}
 */
var belongs_to_dirty = function(_ownerName) {
  const [has_many_fk, name] = [`${_ownerName}_fk`, _ownerName];
  return Ember.computed(name, has_many_fk, function() {
    const has_many = this.get(name);
    const fk = this.get(has_many_fk);
    if (has_many) {
      return has_many.get('id') === fk ? false : true;
    }
    if(!has_many && fk) {
      return true;
    }
  }).readOnly();
};

var belongs_to_track_related_model = function(_ownerName) {
  return Ember.computed(`${_ownerName}.isDirtyOrRelatedDirty`, function(){
    return this.get(`${_ownerName}.isDirtyOrRelatedDirty`);
  })
}


/**
 * Creates belongs_to_rollback method
 *
 * @method belongs_to_rollback
 * @return func
 */
var belongs_to_rollback = function(_ownerName) {
  const [has_many_fk_name, name, func_name] = [`${_ownerName}_fk`, _ownerName, `change_${_ownerName}`];
  return function() {
    const has_many_model = this.get(name);
    const has_many_id = has_many_model ? has_many_model.get('id') : undefined;
    const has_many_fk = this.get(has_many_fk_name);
    if(has_many_id !== has_many_fk) {
      this[func_name](has_many_fk);
    }
  };
};


/**
 * Creates belongs_to_rollback_simple method
 * - used for when data is not bootstrapped
 * @method belongs_to_rollback_simple
 * @return func
 */
var belongs_to_rollback_simple = function(_ownerName) {
  const [has_many_fk_name, name, func_name] = [`${_ownerName}_fk`, _ownerName, `change_${_ownerName}`];
  return function() {
    const has_many_model = this.get(name);
    const has_many_fk = this.get(has_many_fk_name);
    if(has_many_model && has_many_model.get('id') !== has_many_fk) {
      this[func_name]({id: has_many_fk});
    }else if(!has_many_model && has_many_fk) {
      //when changed to null and need to rollback to prev
      this[func_name]({id: has_many_fk});
    }
  };
};


/**
 * Creates belongs_to_save method
 *
 * @method belongs_to_save
 * @return func
 */
var belongs_to_save = function(modelName, _ownerName) {
  const [model, name, has_many_fk_name] = [modelName, _ownerName, `${_ownerName}_fk`];
  return function() {
    const pk = this.get('id');
    const has_many_model = this.get(name);
    run(() => {
      this.get('simpleStore').push(model, { id: pk, [has_many_fk_name]: has_many_model ? has_many_model.get('id') : null });
    });
  };
};

export { belongs_to, change_belongs_to };
