import Ember from 'ember';
const { run } = Ember;
import { many_to_many_extract } from 'bsrs-components/repository/many-to-many';
import { belongs_to_extract } from 'bsrs-components/repository/belongs-to';


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
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response, id);
    } else {
      return this._deserializeList(response);
    }
  },
  _deserializeSingle(response, id) {
    const store = this.get('simpleStore');
    let existing = store.find('dtd', id);
    if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
      // Prep and Attachments
      let attachments_json = response.attachments;
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
        const categories_json = model.categories;
        delete model.categories;
        const existing = store.push('link', model);
        existing.detail = true;
        belongs_to_extract(model.priority_fk, store, existing, 'priority', 'link', 'links');
        belongs_to_extract(model.status_fk, store, existing, 'status', 'link', 'links');

        //categories
        if(categories_json){
          const [m2m_categories, categories, server_sum] = many_to_many_extract(categories_json, store, existing, 'model_categories', 'model_pk', 'category', 'category_pk');
          categories.forEach((cat) => {
              const children_json = cat.children;
              delete cat.children;
              const category = store.push('category', cat);
              if(children_json){
                  let [m2m_children, children, server_sum] = many_to_many_extract(children_json, store, category, 'category_children', 'category_pk', 'category', 'children_pk');
                  children.forEach((cat) => {
                      store.push('category', cat);
                  });
                  m2m_children.forEach((m2m) => {
                      store.push('category-children', m2m);
                  });
                  store.push('category', {id: cat.id, category_children_fks: server_sum});
              }
          });
          m2m_categories.forEach((m2m) => {
              store.push('model-category', m2m);
          });
          store.push('link', {id: model.id, model_categories_fks: server_sum});
        }

        //destination
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

      // Attachments
      let [m2m_attachments, attachments, m2m_attachment_fks] = many_to_many_extract(attachments_json, store, dtd, 'generic_attachments', 'generic_pk', 'attachment', 'attachment_pk');
      run(() => {
        attachments.forEach((att) => {
          store.push('attachment', att);
        });
        m2m_attachments.forEach((m2m) => {
          store.push('generic-join-attachment', m2m);
        });
        store.push('dtd', {id: dtd.get('id'), generic_attachments_fks: m2m_attachment_fks});
      });

      dtd = store.push('dtd', {id: dtd.get('id'), dtd_links_fks: links_server_sum});
      dtd.save();
      existing = dtd;
    }
    return existing;
  },
  _deserializeList(response) {
    const store = this.get('functionalStore');
    const return_array = [];
    response.results.forEach((model) => {
      const dtd = store.push('dtd-list', model);
      return_array.push(dtd);
    });
    return return_array;
  }
});

export default DTDDeserializer;
