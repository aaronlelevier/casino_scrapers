import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import repository from 'bsrs-ember/tests/helpers/repository';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import InputMultiEmailComponent from 'bsrs-ember/components/input-multi-email/component';
import EmailType from 'bsrs-ember/models/email-type';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import PD from 'bsrs-ember/vendor/defaults/person';

var store, eventbus, run = Ember.run;

module('unit: input-multi-email component test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:email', 'service:eventbus']);
        eventbus = this.container.lookup('service:eventbus');
    }
});

test('valid computed should ignore models with an empty or undefined email attr (starting with no bound models)', (assert) => {
    let email;
    let model = store.find('email', {model_fk: PD.idOne});
    let subject = InputMultiEmailComponent.create({model: model, eventbus: eventbus});
    assert.equal(subject.get('valid'), true);
    run(() => {
        email = model.push({id: 'def456', type: ETD.personalId, model_fk: PD.idOne});
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        email.set('email', '1');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        email.set('email', '');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        email.set('email', ' ');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
});

test('valid computed should ignore models with an empty or undefined email attr (when the middle model is modified)', (assert) => {
    let email_two;
    let model = store.find('email', {model_fk: PD.idOne});
    let subject = InputMultiEmailComponent.create({model: model, eventbus: eventbus});
    assert.equal(subject.get('valid'), true);
    run(() => {
        let email_one = model.push({id: 'def457', type: ETD.personalId, model_fk: PD.idOne});
        email_two = model.push({id: 'def458', type: ETD.personalId, model_fk: PD.idOne});
        let email_three = model.push({id: 'def459', type: ETD.personalId, model_fk: PD.idOne});
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        email_two.set('email', '1');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        email_two.set('email', '');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        email_two.set('email', ' ');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
});

test('valid computed should ignore models with an empty or undefined email attr (when the middle model is blank)', (assert) => {
    let email_one;
    let email_two;
    let email_three;
    let model = store.find('email', {model_fk: PD.idOne});
    let subject = InputMultiEmailComponent.create({model: model, eventbus: eventbus});
    assert.equal(subject.get('valid'), true);
    run(() => {
        email_one = model.push({id: 'def457', type: ETD.personalId, model_fk: PD.idOne});
        email_two = model.push({id: 'def458', type: ETD.personalId, model_fk: PD.idOne});
        email_three = model.push({id: 'def459', type: ETD.personalId, model_fk: PD.idOne});
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        email_one.set('email', 'abcgmail.com');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        email_one.set('email', 'snewcomer@wat.com');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        email_three.set('email', '515-343-223');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        email_three.set('email', 'aaron@gmail.com');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        email_two.set('email', '515');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        email_two.set('email', '');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
});
