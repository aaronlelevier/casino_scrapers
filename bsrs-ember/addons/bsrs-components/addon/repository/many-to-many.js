import Ember from 'ember';

var many_to_many_extract = function(json, store, model, join_models_str, main_pk, related_str, related_pk) {
  //cc_json, store, ticket, ticket_cc, ticket_pk, person, person_pk
  const server_sum = [];
  const m2m_models = [];
  const relateds = [];
  const related_ids = json.mapBy('id'); //server side people
  const join_models = model.get(`${join_models_str}`) || [];
  const join_model_pks = join_models.mapBy(`${related_pk}`);//client side people
  const model_pk = model.get('id');
  for (let i = json.length-1; i >= 0; i--){
    const pk = Ember.uuid();
    const many_models = json[i];
    const existing = store.find(`${related_str}`, many_models.id);
    if(!existing.get('content')){
      relateds.push(many_models);
    }
    if(Ember.$.inArray(many_models.id, join_model_pks) < 0){
      server_sum.push(pk);
      let m2m_model = {id: pk};
      m2m_model[`${main_pk}`] = model_pk;
      m2m_model[`${related_pk}`] = many_models.id;
      m2m_models.push(m2m_model);
    }
  }
  join_models.forEach((m2m) => {
    if(Ember.$.inArray(m2m.get(`${related_pk}`), related_ids) > -1){
      server_sum.push(m2m.id);
      return;
      //TODO: just make else statement and see if all tests pass
    }else if(Ember.$.inArray(m2m.get(`${related_pk}`), related_ids) < 0){
      m2m_models.push({id: m2m.get('id'), removed: true});
    }
  });
  return [m2m_models, relateds, server_sum];
};

export { many_to_many_extract };

