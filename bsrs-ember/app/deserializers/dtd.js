import Ember from 'ember';
const { run } = Ember;
import { many_to_many_extract } from 'bsrs-components/repository/many-to-many';
import { belongs_to_extract, belongs_to_extract_contacts } from 'bsrs-components/repository/belongs-to';
import registerCB from 'bsrs-ember/utilities/registerCB';


var extract_attachments = function(model, store) {
  model.attachments.forEach((attachment) => {
    store.push('attachment', attachment);
  });
  return model.attachments.mapBy('id');
};

var extract_destination = function(destination_json, store, link_model) {
  let destination_id = destination_json.id;
  if(link_model.get('destination.id') !== destination_id) {
    link_model.change_destination(destination_json);
  }
};

var DTDDeserializer = Ember.Object.extend({
  deserialize(response, options) {
    if (typeof options === 'undefined') {
      return this.deserialize_list(response);
    } else {
      return this.deserialize_single(response, options);
    }
  },
  deserialize_single(response, id) {
    const store = this.get('store');
    let existing = store.find('dtd', id);
    let return_dtd = existing;
    if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
      // Prep and Attachments
      response.dtd_attachments_fks = extract_attachments(response, store);
      response.previous_attachments_fks = response.dtd_attachments_fks;
      delete response.attachments;
      let link_json = response.links;
      delete response.links;
      let field_json = response.fields;
      delete response.fields;
      let dtd = store.push('dtd', response);

      // Links
      let [m2m_links, links, links_server_sum] = many_to_many_extract(link_json, store, dtd, 'dtd_links', 'dtd_pk', 'link', 'link_pk');
      m2m_links.forEach((m2m) => {
        run(() => {
          store.push('dtd-link', m2m);
        });
      });
      link_json.forEach((model) => {
        const destination_json = model.destination;
        delete model.destination;
        const existing = store.push('link', model);
        existing.detail = true;
        belongs_to_extract(model.priority_fk, store, existing, 'priority', 'link', 'links');
        belongs_to_extract(model.status_fk, store, existing, 'status', 'link', 'links');
        store.push('dtd', {id: model.destination_fk});
        if(destination_json){
          extract_destination(destination_json, store, existing);
        }
        // if (existing.get('destination.id') !== model.destination_fk) {
        //   existing.change_destination(model.destination);
        // }
      });

      // Fields
      let [m2m_fields, fields, fields_server_sum] = many_to_many_extract(field_json, store, dtd, 'dtd_fields', 'dtd_pk', 'field', 'field_pk');
      m2m_fields.forEach((m2m) => {
        run(() => {
          store.push('dtd-field', m2m);
        });
      });
      field_json.forEach((model) => {
        let option_json = model.options;
        delete model.options;
        const field = store.push('field', model);
        field.detail = true;
        let [m2m_options, options, options_server_sum] = many_to_many_extract(option_json, store, field, 'field_options', 'field_pk', 'option', 'option_pk');
        m2m_options.forEach((m2m) => {
          run(() => {
            store.push('field-option', m2m);
          });
        });
        option_json.forEach((model) => {
          let _option = store.push('option', model);
        });
      });
      dtd = store.push('dtd', {id: dtd.get('id'), dtd_link_fks: links_server_sum});
      dtd.save();
      return_dtd = dtd;
    }
    return return_dtd;
  },
  deserialize_list(response) {
    const store = this.get('store');
    const return_array = [];
    registerCB(response, function(model) {
      const existing = store.find('dtd', model.id);
      if(!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')){
        const dtd = store.push('dtd-list', model);
        return_array.push(dtd);
      }
    });
    return return_array;
  }
});

export default DTDDeserializer;






