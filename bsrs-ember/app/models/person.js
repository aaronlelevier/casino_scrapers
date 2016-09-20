import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectRepo from 'bsrs-ember/utilities/inject';
import CopyMixin from 'bsrs-ember/mixins/model/copy';
// import EmailMixin from 'bsrs-ember/mixins/model/email';
// import PhoneNumberMixin from 'bsrs-ember/mixins/model/phone_number';
// import AddressMixin from 'bsrs-ember/mixins/model/address';
import RoleMixin from 'bsrs-ember/mixins/model/person/role';
import LocationMixin from 'bsrs-ember/mixins/model/person/location';
import LocaleMixin from 'bsrs-ember/mixins/model/person/locale';
import config from 'bsrs-ember/config/environment';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many, many_to_many_dirty_unlessAddedM2M } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/person';

const Validations = buildValidations({
  username: [
    validator('presence', {
      presence: true,
      message: 'errors.person.username'
    }),
    validator('unique-username', {
      debounce: 300,
      disabled: Ember.computed(function() {
        return this.get('model.isDirtyOrRelatedDirty') ? false : true;
      }).volatile()
    }),
  ],
  // password: [
  //   validator('presence', {
  //     presence: true,
  //     message: 'errors.person.password',
  //   }),
  //   // validator('format', {
  //   //   /*
  //   //    * Password must include at least one upper case letter, one lower case letter, and a number
  //   //    * (?=) positive lookahead. requires express to match .*\d ..... .* matches any single character 0 or more times with one decimal
  //   //    * () acts as a memory device to remember the match as it traverses through the string
  //   //    * b/w 4-8 occurences of the previous look ahead assertions
  //   //   */
  //   //   regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/,
  //   //   message: 'errors.person.password'
  //   // }),
  //   validator('length', {
  //     max: 15,
  //     message: 'errors.person.password.length',
  //   }),
  // ],
  first_name: [
    validator('presence', {
      presence: true,
      message: 'errors.person.first_name',
    }),
    validator('length', {
      max: 30,
      message: 'errors.person.first_name.length',
    }),
  ],
  middle_initial: validator('format', {
    regex: /^[a-zA-Z]*$/,
    message: 'errors.person.middle_initial'
  }),
  last_name: [
    validator('presence', {
      presence: true,
      message: 'errors.person.last_name'
    }),
    validator('length', {
      max: 30,
      message: 'errors.person.last_name.length'
    }),
  ],
  phonenumbers: validator('has-many'),
  emails: validator('has-many'),
});

var Person = Model.extend(Validations, CopyMixin, LocationMixin, NewMixin, OptConf, RoleMixin, LocaleMixin, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('status', 'person', {bootstrapped:true});
    belongs_to.bind(this)('role', 'person', {bootstrapped:true, change_func:false, rollback: false});
    belongs_to.bind(this)('locale', 'person', {bootstrapped:true, change_func:false});
    many_to_many.bind(this)('location', 'person', {plural:true, add_func: false, rollback:false, save:false});
    many_to_many.bind(this)('phonenumber', 'person', {plural:true, dirty:false});
    many_to_many.bind(this)('email', 'person', {plural:true, dirty:false});
  },
  type: 'person',
  simpleStore: Ember.inject.service(),
  status_repo: injectRepo('status'),
  locale_repo: injectRepo('locale'),
  username: attr(''),
  usernameIsDirty() {
    // NOTES: why do this?
    return this.get('_dirty')['username'];
  },
  password: attr(''),
  first_name: attr(''),
  middle_initial: attr(''),
  last_name: attr(''),
  title: attr(''),
  employee_id: attr(''),
  auth_amount: attr(''),
  auth_currency: attr(),
  password_one_time: attr(),
  locale_fk: undefined,
  role_fk: undefined,
  status_fk: undefined,
  person_phonenumbers_fks: [],
  person_emails_fks: [],
  person_locations_fks: [],
  changingPassword: false,
  //models are leaf nodes and should be given a set of data and encapsulate and work on that data
  //tightly coupled.  Ideally, route would get services or hand off to another service to collect them all
  //and hands all information.  Person owns locale, so how do you rollback locale
  personCurrent: Ember.inject.service('person-current'),
  translationsFetcher: Ember.inject.service('translations-fetcher'),
  i18n: Ember.inject.service(),
  changeLocale(){
    const personCurrent = this.get('personCurrent');
    const personCurrentId = personCurrent.get('model.id');
    if(personCurrentId === this.get('id')){
      config.i18n.currentLocale = this.get('locale').get('locale');
      return this.get('translationsFetcher').fetch().then(function(){
        this.get('i18n').set('locale', config.i18n.currentLocale);
      }.bind(this));
    }
  },
  fullname: Ember.computed('first_name', 'last_name', function() {
    const { first_name, last_name } = this.getProperties('first_name', 'last_name');
    return first_name + ' ' + last_name;
  }),
  // PH
  phonenumbersIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('person_phonenumbers'),
  phonenumbersIsDirty: Ember.computed('phonenumbers.@each.{isDirtyOrRelatedDirty}', 'phonenumbersIsDirtyContainer', function() {
    const phonenumbers = this.get('phonenumbers');
    return phonenumbers.isAny('isDirtyOrRelatedDirty') || this.get('phonenumbersIsDirtyContainer');
  }),
  phonenumbersIsNotDirty: Ember.computed.not('phonenumbersIsDirty'),
  rollbackPhonenumbersContainer() {
    const phonenumbers = this.get('phonenumbers');
    phonenumbers.forEach((model) => {
      model.rollback();
    });
  },
  savePhonenumbersContainer() {
    const phonenumbers = this.get('phonenumbers');
    phonenumbers.forEach((phonenumber) => {
      // remove non valid phone numbers
      if (phonenumber.get('invalid_number')) {
        this.removePhonenumber(phonenumber);
      } else {
        phonenumber.saveRelated();
        phonenumber.save();
      }
    });
  },
  removePhonenumber(phonenumber) {
    const remove_joins = [];
    this.get('person_phonenumbers').forEach((join_model) => {
      if (join_model.get('phonenumber_pk') === phonenumber.get('id')) {
        remove_joins.push(join_model.get('id'));
      } 
    });
    run(() => {
      remove_joins.forEach((join_model_pk) => {
        this.get('simpleStore').push('person-join-phonenumber', {id: join_model_pk, removed: true}) ;
        this.set('person_phonenumbers_fks', this.get('person_phonenumbers_fks').filter(fk => fk === join_model_pk));
      });
    });
  },
  // EMAIL
  emailsIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('person_emails'),
  emailsIsDirty: Ember.computed('emails.@each.{isDirtyOrRelatedDirty}', 'emailsIsDirtyContainer', function() {
    const emails = this.get('emails');
    return emails.isAny('isDirtyOrRelatedDirty') || this.get('emailsIsDirtyContainer');
  }),
  emailsIsNotDirty: Ember.computed.not('emailsIsDirty'),
  rollbackEmailsContainer() {
    const emails = this.get('emails');
    emails.forEach((model) => {
      model.rollback();
    });
  },
  saveEmailsContainer() {
    const emails = this.get('emails');
    emails.forEach((email) => {
      // remove non valid phone numbers
      if (email.get('invalid_email')) {
        this.removeEmail(email);
      } else {
        email.saveRelated();
        email.save();
      }
    });
  },
  removeEmail(email) {
    const remove_joins = [];
    this.get('person_emails').forEach((join_model) => {
      if (join_model.get('email_pk') === email.get('id')) {
        remove_joins.push(join_model.get('id'));
      } 
    });
    run(() => {
      remove_joins.forEach((join_model_pk) => {
        this.get('simpleStore').push('person-join-email', {id: join_model_pk, removed: true}) ;
        this.set('person_emails_fks', this.get('person_emails_fks').filter(fk => fk === join_model_pk));
      });
    });
  },
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'emailsIsDirty', 'phonenumbersIsDirty', 'roleIsDirty', 'locationsIsDirty', 'statusIsDirty', 'localeIsDirty', function() {
    return ( this.get('detail') || this.get('new') ) && ( this.get('isDirty') || this.get('phonenumbersIsDirty') || this.get('roleIsDirty') || this.get('locationsIsDirty') || this.get('statusIsDirty') || this.get('emailsIsDirty') || this.get('localeIsDirty') );
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  clearPassword() {
    this.set('password', '');
  },
  saveRelated() {
    this.saveEmailsContainer();
    this.saveEmails();
    this.savePhonenumbersContainer();
    this.savePhonenumbers();
    // this.saveAddresses();
    this.saveRole();
    this.saveLocations();
    this.clearPassword();
    this.saveStatus();
    this.saveLocale();
  },
  rollback() {
    this.changeLocale();
    this.rollbackEmailsContainer();
    this.rollbackEmails();
    this.rollbackPhonenumbersContainer();
    this.rollbackPhonenumbers();
    // this.rollbackAddresses();
    this.rollbackRole();
    this.rollbackLocations();
    this.rollbackStatus();
    this.rollbackLocale();
    this._super(...arguments);
  },
  createSerialize() {
    return {
      id: this.get('id'),
      username: this.get('username'),
      password: this.get('password'),
      first_name: this.get('first_name'),
      middle_initial: this.get('middle_initial'),
      last_name: this.get('last_name'),
      role: this.get('role').get('id'),
      status: this.get('status_fk') || this.get('status_repo').get_default().get('id'),
      locale: this.get('locale.id') || this.get('locale_repo').get_default().get('id'),
    };
  },
  serialize() {
    const store = this.get('simpleStore');
    const emails = this.get('emails').filter(function(email) {
      if(email.get('invalid_email')) {
        return;
      }
      return email;
    }).map((email) => {
      return email.serialize();
    });
    const phonenumbers = this.get('phonenumbers').filter(function(num) {
      if(num.get('invalid_number')) {
        return;
      }
      return num;
    }).map(function(num) {
      return num.serialize();
    });
    // const addresses = this.get('addresses').filter(function(address) {
    //   if (address.get('invalid_address')) {
    //     return;
    //   }
    //   return address;
    // }).map(function(address) {
    //   return address.serialize();
    // });

    var payload = {
      id: this.get('id'),
      username: this.get('username'),
      first_name: this.get('first_name'),
      middle_initial: this.get('middle_initial'),
      last_name: this.get('last_name'),
      title: this.get('title'),
      employee_id: this.get('employee_id'),
      auth_amount: this.get('auth_amount') || null,
      auth_currency: this.get('auth_currency'),
      status: this.get('status').get('id'),
      role: this.get('role').get('id'),
      locations: this.get('locations_ids'),
      emails: emails,
      phone_numbers: phonenumbers,
      // addresses: addresses,
      locale: this.get('locale.id'),
      password: this.get('password')
    };
    if (!this.get('password')) {
      delete payload.password;
    }
    return payload;

  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('person', this.get('id'));
    });
  }
});

export default Person;
