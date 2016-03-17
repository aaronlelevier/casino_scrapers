import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
// import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDL from 'bsrs-ember/vendor/defaults/dtd-link';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';

let store, dtd, uuid, trans, link, dtd_repo;

moduleForComponent('dtds/dtd-single', 'integration: dtd-single test', {
    integration: true,
    beforeEach() {
        page.setContext(this);
        generalPage.setContext(this);
        ticketPage.setContext(this);
        store = module_registry(this.container, this.registry, ['model:dtd', 'model:uuid']);
        trans = this.container.lookup('service:i18n');
        run(() => {
            dtd = store.push('dtd', {});
        });
        dtd_repo = repository.initialize(this.container, this.registry, 'dtd');
        dtd_repo.update = () => { return new Ember.RSVP.Promise(() => {}); };
    },
    afterEach() {
        page.removeContext(this);
        generalPage.removeContext(this);
        ticketPage.removeContext(this);
    }
});

test('validation works as expected', function(assert) {
    let statuses = store.find('dtd-status');
    this.set('model', dtd);
    this.render(hbs`{{dtds/dtd-single model=model}}`);
    let $component = this.$('.t-dtd-key-error');
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':visible'));
    this.$('.t-dtd-key').val('a').trigger('change');
    assert.equal($component.text().trim(), 'Key must be provided');
});

test('add and remove dtd links', function(assert) {
    run(() => {
        dtd = store.push('dtd', {id: DTD.idOne});
        uuid = store.push('uuid', {id: 1});
        dtd.add_link({id: uuid.v4()});
    });
    this.set('model', dtd);
    this.render(hbs`{{dtds/dtd-single model=model}}`);
    let $component = this.$('.t-input-multi-dtd-link');
    assert.ok($component.is(':visible'));
    var add_btn = this.$('.t-add-link-btn');
    assert.equal($component.find('.t-dtd-link-request').length, 1);
    assert.equal($component.find('.t-dtd-link-text').length, 1);
    assert.equal($component.find('.t-dtd-link-action_button').length, 1);
    assert.equal($component.find('.t-dtd-link-is_header').length, 1);
    assert.equal($component.find('.t-ticket-priority-select').length, 1);
    assert.equal($component.find('.t-ticket-status-select').length, 1);
    add_btn.trigger('click').trigger('change');
    assert.equal($component.find('.t-dtd-link-request').length, 2);
    add_btn.trigger('click').trigger('change');
    assert.equal($component.find('.t-dtd-link-request').length, 3);
    var remove_btn = this.$('.t-del-link-btn:eq(0)');
    remove_btn.trigger('click').trigger('change');
    assert.equal($component.find('.t-dtd-link-request').length, 2);
});

test('must have one link, cant remove last link, remove btn clears link', function(assert) {
    let links = store.find('link');
    run(() => {
            dtd = store.push('dtd', {id: DTD.idOne, dtd_link_fks: [DTDL.idOne]});
            store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
            store.push('ticket-priority', {id: TP.priorityOneId, name: TP.priorityOne, links: [LINK.idOne]});
            store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, links: [LINK.idOne]});
            link = store.push('link', {id: LINK.idOne, request: LINK.requestOne, text: LINK.textOne,
                action_button: LINK.action_buttonOne, is_header: LINK.is_headerOne});
    });
    this.set('model', dtd);
    this.render(hbs`{{dtds/dtd-single model=model}}`);
    let $component = this.$('.t-input-multi-dtd-link');
    assert.ok($component.is(':visible'));
    var add_btn = this.$('.t-add-link-btn');
    assert.equal($component.find('.t-dtd-link-request').length, 1);
    assert.equal($component.find('.t-dtd-link-text').length, 1);
    assert.equal($component.find('.t-dtd-link-action_button').length, 1);
    assert.equal($component.find('.t-dtd-link-is_header').length, 1);
    assert.equal($component.find('.t-ticket-priority-select').length, 1);
    assert.equal($component.find('.t-ticket-status-select').length, 1);
    assert.equal(page.request, LINK.requestOne);
    assert.equal(page.text, LINK.textOne);
    assert.equal(page.action_button(), LINK.action_buttonOne);
    assert.equal(page.is_header(), LINK.is_headerOne);
    assert.equal(ticketPage.priorityInput.split(' ').slice(0,-1).join(' '), trans.t(TP.priorityOne));
    assert.equal(ticketPage.statusInput.split(' ').slice(0,-1).join(' '), trans.t(TD.statusOne));
    var remove_btn = this.$('.t-del-link-btn:eq(0)');
    remove_btn.trigger('click').trigger('change');
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.equal(page.request, '');
    assert.equal(page.text, '');
    assert.equal(page.action_button(), LINK.action_buttonTwo);
    assert.equal(page.is_header(), LINK.is_headerTwo);
    assert.equal(ticketPage.priorityInput.split(' ').slice(0,-1).join(' '), '');
    assert.equal(ticketPage.statusInput.split(' ').slice(0,-1).join(' '), '');
});

test('add and remove dtd links', function(assert) {
    run(() => {
        dtd = store.push('dtd', {id: DTD.idOne});
        uuid = store.push('uuid', {id: 1});
        dtd.add_link({id: uuid.v4()});
    });
    this.set('model', dtd);
    this.render(hbs`{{dtds/dtd-single model=model}}`);
    let $component = this.$('.t-input-multi-dtd-link');
    assert.ok($component.is(':visible'));
    generalPage.save();
    assert.equal(page.textIsRequiredError(), 'Text must be provided');
});
