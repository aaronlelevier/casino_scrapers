import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import TD from 'bsrs-ember/vendor/defaults/ticket';
// import timemachine from 'vendor/timemachine';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';

var ticket, store, trans;

moduleForComponent('timestamp-created test', 'Integration | Component | timestamp created', {
    integration: true,
    setup() {
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:person']);
        // timemachine.config({
        //     dateString: 'December 25, 2015 13:12:59'
        // });
        trans = this.container.lookup('service:i18n');
        loadTranslations(trans, translations.generate('en'));
        translation.initialize(this);
        ticket = store.push('ticket', {id: TD.idOne, requester: 'wat', created: new Date()});
    }
});

test('it renders with correct string', function(assert) {
    this.model = ticket;
    this.render(hbs`{{timestamp-created model=model}}`);
    assert.equal(this.$().text().trim(), 'wat created this ticket a few seconds ago');
});
