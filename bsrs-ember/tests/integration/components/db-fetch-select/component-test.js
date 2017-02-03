import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import { clickTrigger, triggerKeydown, nativeMouseUp, nativeMouseDown, typeInSearch } from 'bsrs-ember/tests/helpers/ember-power-select';
import waitFor from 'ember-test-helpers/wait';

const PD = PERSON_DEFAULTS.defaults();
let store, trans, person_repo, ticket, person;

moduleForComponent('db-fetch-select', 'Integration | Component | db fetch person select', {
  integration: true,
  beforeEach() {
    trans = this.container.lookup('service:i18n');  
    store = module_registry(this.container, this.registry, ['model:person']);
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    person_repo = repository.initialize(this.container, this.registry, 'person');
    ticket = store.push('ticket', {id: TD.idOne});
    store.push('related-person', { id: PD.idOne, fullname: PD.fullname, assigned_tickets: [TD.idOne], photo: { id: '9', image_thumbnail: 'foo.jpg', people: [PD.idOne]} });
    store.push('attachment', {id: '9', image_thumbnail: 'foo.jpg', people: [PD.idOne]});
    person_repo.findPeople = function() {
      return [
        {id: PD.idTwo, fullname: 'wat', photo: {id: '11 ', image_thumbnail: 'bat.jpg'}}
      ];
    };
  }
});

test('it renders with name and photo', function(assert) {
  this.model = ticket;
  this.person_repo = person_repo;
  this.render(hbs`
    {{db-fetch-select
      model=model 
      selectedAttr=model.assignee
      className="t-ticket-person-select"
      displayName="fullname"
      change_func="change_assignee"
      repository=person_repo
      searchMethod="findPeople"
      componentArg="photo-avatar"
    }}
  `);
  assert.equal(this.$('[data-test-id="user-fullname"]').text().trim(), PD.fullname);
  assert.ok(this.$('[data-test-id="user-avatar"]').css('background-image').includes('foo.jpg'));
  clickTrigger();
  typeInSearch('w');
  return waitFor().then(() => {
    nativeMouseUp('.ember-power-select-option:contains("wat")');
    assert.equal(this.$('[data-test-id="user-fullname"]').text().trim(), 'wat');
    assert.ok(this.$('[data-test-id="user-avatar"]').css('background-image').includes('bat.jpg'));
  });
});

test('it renders with a placeholder', function(assert) {
  this.render(hbs`
    {{db-fetch-select
      placeholder="select.person"
    }}
  `);
  assert.equal(this.$('.ember-power-select-placeholder').text().trim(), 'select.person');
});
