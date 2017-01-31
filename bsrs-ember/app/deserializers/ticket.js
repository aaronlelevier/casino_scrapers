import Ember from 'ember';
const { run } = Ember;
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import { belongs_to_extract, belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract, many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/ticket';

var TicketDeserializer = Ember.Object.extend(OptConf, {
  init() {
    belongs_to.bind(this)('status', 'general');
    belongs_to.bind(this)('priority', 'ticket');
    belongs_to.bind(this)('assignee', 'person');
    belongs_to.bind(this)('location', 'location');
    belongs_to.bind(this)('photo');
    many_to_many.bind(this)('cc', 'ticket');
    many_to_many.bind(this)('wo', 'ticket');
    many_to_many.bind(this)('attachments', 'ticket');
  },
  workOrderDeserializer: injectDeserializer('work-order'),
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response);
    } else {
      return this._deserializeList(response);
    }
  },
  setupCC(cc_json, ticket) {
    this.setup_cc(cc_json, ticket);
  },
  setupWorkOrder(ticket, work_order_json = []) {
    const workOrderDeserializer = this.get('workOrderDeserializer');
    // work order will contain related json that we do not want to push in store (e.g. currency)
    const work_order_json_simple = work_order_json.map((wo) => {
      return { id: wo.id };
    });
    this.setup_wo(work_order_json_simple, ticket);
    work_order_json.forEach((wo) => {
      // push remaining attrs and setup relationships on work order model
      workOrderDeserializer.deserialize(wo, wo.id);
    });
  },
  setupCategories(categories_json, ticket) {
    const store = this.get('simpleStore');
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
      ticket = store.push('ticket', {id: ticket.get('id'), model_categories_fks: server_sum});
      ticket.save();
    });
  },
  _deserializeSingle(response) {
    const store = this.get('simpleStore');
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
    let work_order_json = response.work_orders;
    delete response.work_orders;
    let attachments_json = response.attachments.map((id) => { return { id: id }; });
    delete response.attachments;
    const categories_json = response.categories;
    delete response.categories;
    response.detail = true;
    let ticket = store.push('ticket', response);
    
    // SETUP
    this.setup_status(response.status_fk, ticket);
    this.setup_priority(response.priority_fk, ticket);
    this.setup_assignee(assignee_json, ticket);
    this.setup_location(location_json, ticket);
    this.setupCC(cc_json, ticket);
    this.setupCategories(categories_json, ticket);
    this.setupWorkOrder(ticket, work_order_json);

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
    return ticket;
  },
  _deserializeList(response) {
    const store = this.get('functionalStore');
    const results = [];
    response.results.forEach((model) => {
      const categories = model.categories;
      delete model.categories;
      
      const sorted_categories = categories.sortBy('level');
      const names = sorted_categories.map((category) => {
        return category.name;
      }).join(' &#8226; ');

      model.categories = Ember.String.htmlSafe(names);

      const ticket = store.push('ticket-list', model);
      results.push(ticket);
    });
    return results;
  }
});

export default TicketDeserializer;
