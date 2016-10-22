import Ember from 'ember';
const { run } = Ember;
import { belongs_to_extract, belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract, many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/ticket';

var TicketDeserializer = Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('status', 'general');
    belongs_to.bind(this)('priority', 'ticket');
    belongs_to.bind(this)('assignee', 'person');
    belongs_to.bind(this)('location', 'location');
    many_to_many.bind(this)('cc', 'ticket');
    many_to_many.bind(this)('attachments', 'ticket');
  },
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response);
    } else {
      this._deserializeList(response);
    }
  },
  _deserializeSingle(response) {
    let store = this.get('simpleStore');
    // belongs-to
    let location_json = response.location;
    // TODO: ticket always have a location?
    response.location_fk = location_json.id;
    delete response.location;
    let assignee_json = response.assignee;
    response.assignee_fk = response.assignee ? response.assignee.id : undefined;
    delete response.assignee;
    // m2m
    let cc_json = response.cc;
    delete response.cc;
    let attachments_json = response.attachments.map((id) => { return { id: id }; });
    delete response.attachments;
    const categories_json = response.categories;
    delete response.categories;
    response.detail = true;
    let ticket = store.push('ticket', response);
    this.setup_status(response.status_fk, ticket);
    this.setup_priority(response.priority_fk, ticket);
    if (assignee_json) {
      this.setup_assignee(assignee_json, ticket);
    }
    if (location_json) {
      this.setup_location(location_json, ticket);
    }
    this.setup_cc(cc_json, ticket);
    // this.setup_attachments(attachments_json, ticket);
    let [m2m_attachments, attachments, m2m_attachment_fks] = many_to_many_extract(attachments_json, store, ticket, 'generic_attachments', 'generic_pk', 'attachment', 'attachment_pk');
    run(() => {
      attachments.forEach((att) => {
        store.push('attachment', att);
      });
      m2m_attachments.forEach((m2m) => {
        store.push('generic-join-attachment', m2m);
      });
      store.push('ticket', {id: ticket.get('id'), generic_attachments_fks: m2m_attachment_fks});
    });
    let [m2m_categories, categories, server_sum] = many_to_many_extract(categories_json, store, ticket, 'model_categories', 'model_pk', 'category', 'category_pk');
    run(() => {
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
      ticket = store.push('ticket', {id: response.id, model_categories_fks: server_sum});
      ticket.save();
    });
    return ticket;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      const category_json = model.categories;
      model.category_ids = category_json.mapBy('id');
      category_json.forEach((category) => {
        //TODO: test this
        store.push('category-list', category);
      });
      delete model.categories;
      const status_json = model.status;
      delete model.status;
      const priority_json = model.priority;
      delete model.priority;
      const ticket = store.push('ticket-list', model);
      this.setup_status(status_json, ticket);
      this.setup_priority(priority_json, ticket);
    });
  }
});

export default TicketDeserializer;
