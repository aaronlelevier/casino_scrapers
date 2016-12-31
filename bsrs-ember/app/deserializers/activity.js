import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';

let extract_comment = function(model) {
  if (model.content && model.content.comment) {
    model.comment = model.content.comment;
  }
};

let extract_category = function(store, model, uuid) {
  const content = model.content;
  if (content && model.type === 'categories' && content.to && content.from) {
    const to = content.to;
    const from = content.from;
    to.forEach((to) => {
      to.id = uuid.v4();
      to.activities = [model.id];
      store.push('activity/category-to', to);
    });
    from.forEach((from) => {
      from.id = uuid.v4();
      from.activities = [model.id];
      store.push('activity/category-from', from);
    });
  }
};


/**
 * add model_id (activity id) to the activities array of the, e.g. activity/send-email model
 * prevents a cc model from having only one activity model by finding and concating the activity id
 * @method add_activity_to_cc
 */
let add_activity_to_cc = function(cc, model_id, type, store) {
  const existing_activities = store.find(`activity/${type}`, cc.id).get('activities') || [];
  cc.activities = existing_activities.concat(model_id).uniq();
  store.push(`activity/${type}`, cc);
};

/**
 * @method extract_to_and_from_or_added_removed
 */
let extract_to_and_from_or_added_removed = function(store, model) {
  const content = model.content;
  const model_id = model.id;
  if (content) {
    if (content.to && content.to.id) {
      store.push(`activity/${model.type}`, model.content.to);
      store.push(`activity/${model.type}`, model.content.from);
      model.to_fk = model.content.to.id;
      model.from_fk = model.content.from.id;
    } else if (content.added) {
      const type = model.type.dasherize();
      content.added.forEach((cc) => {
        if(cc.file){
          cc.ext = cc.file.split('.').pop().toLowerCase();
        }
        add_activity_to_cc(cc, model_id, type, store);
      });
    } else if (content.removed) {
      const type = model.type.dasherize();
      content.removed.forEach((cc) => {
        add_activity_to_cc(cc, model_id, type, store);
      });
    } else if (content.send_sms || content.send_email) {
      const type = model.type.dasherize();
      content[`${model.type}`].forEach((cc) => {
        add_activity_to_cc(cc, model_id, type, store);
      });
    } else {
      model.to_fk = model.content.to;
      model.from_fk = model.content.from;
    }
  }
};

let extract_person = function(store, model) {
  if (model.person) {
    store.push('activity/person', model.person);
    model.person_fk = model.person.id;
  }
  delete model.person;
};

let extract_automation = function(store, model) {
  if (model.automation) {
    store.push('activity/automation', model.automation);
    model.automation_fk = model.automation.id;
  }
  delete model.automation;
};

let ActivityDeserializer = Ember.Object.extend({
  uuid: inject('uuid'),
  deserialize(response, type) {
    let uuid = this.get('uuid');
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      extract_comment(model);
      extract_category(store, model, uuid);
      extract_to_and_from_or_added_removed(store, model);
      extract_person(store, model);
      extract_automation(store, model);
      delete model.content;
      store.push('activity', model);
    });
  },
});

export default ActivityDeserializer;
