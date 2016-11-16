import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import { clickTrigger, triggerKeydown, nativeMouseUp, nativeMouseDown, typeInSearch } from 'bsrs-ember/tests/helpers/ember-power-select';
import waitFor from 'ember-test-helpers/wait';

let store, trans, person_repo, ticket, person;

moduleForComponent('db-fetch-person-multi-select', 'Integration | Component | db fetch person multi select', {
  integration: true,
  beforeEach() {
    trans = this.container.lookup('service:i18n');  
    store = module_registry(this.container, this.registry, ['model:person']);
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    person_repo = repository.initialize(this.container, this.registry, 'person');
    ticket = store.push('ticket', {id: TD.idOne});
    store.push('person', {id: PD.idOne, fullname: PD.fullname, assigned_tickets: [TD.idOne], photo_fk: '9'});
    store.push('attachment', {id: '9', image_thumbnail: 'foo.jpg', people: [PD.idOne]});
    person_repo.findPeople = function() {
      return [
        {id: PD.idTwo, fullname: 'Scott', photo: {id: '11 ', image_thumbnail: 'bat.jpg'}},
        {id: PD.idThree, fullname: 'Arron', photo: {id: '12 ', image_thumbnail: 'bat1.jpg'}},
        {id: PD.idBoy, fullname: 'Terrance', photo: {id: '13 ', image_thumbnail: 'bat2.jpg'}}
      ];
    };
  }
});

test('terrance it renders', function(assert) {
  this.model = ticket;
  this.person_repo = person_repo;
  this.render(hbs`
    {{db-fetch-person-multi-select
      model=model 
      multiAttr="cc" 
      multiAttrIds="cc_ids" 
      selectedAttr=model.cc 
      className="t-ticket-cc-select" 
      displayName="fullname" 
      add_func="add_cc" 
      remove_func="remove_cc" 
      repository=person_repo 
      searchMethod="findPeople"
    }}
  `);
  clickTrigger();
  typeInSearch('a');
  return waitFor().then(() => {
    nativeMouseUp('.ember-power-select-option:contains("Scott")');
    assert.equal(this.$('[data-test-id="user-fullname"]').text().trim(), 'Scott');
    assert.ok(this.$('[data-test-id="user-avatar"]').css('background-image').includes('bat.jpg'));
    clickTrigger();
    typeInSearch('a');
    return waitFor().then(() => {
      nativeMouseUp('.ember-power-select-option:contains("Terrance")');
      assert.equal(this.$('[data-test-id="user-fullname"]:eq(1)').text().trim(), 'Terrance');
      assert.ok(this.$('[data-test-id="user-avatar"]:eq(1)').css('background-image').includes('bat2.jpg'));
      nativeMouseDown('.ember-power-select-multiple-remove-btn:eq(0)');
    });
  });
});
