from datetime import date

from django.conf import settings
from django.contrib.auth.models import AbstractUser, Group
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.test import TestCase
from django.utils.timezone import localtime, now

from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from category.tests.factory import create_single_category
from contact.models import Email
from contact.tests.factory import create_contact
from location.models import Location
from location.tests.factory import create_locations
from person.models import Person, PersonManager, PersonQuerySet, PersonStatus, Role
from person.tests.factory import (PASSWORD, create_person, create_role, create_single_person,
    get_or_create_tenant)
from translation.models import Locale
from utils import create
from utils.models import DefaultNameManager
from utils.tests.test_helpers import create_default
from utils.tests.test_validators import (DIGITS, NO_DIGITS, UPPER_CHARS, NO_UPPER_CHARS,
    LOWER_CHARS, NO_LOWER_CHARS, SPECIAL_CHARS, NO_SPECIAL_CHARS)


### ROLE

class RoleTests(TestCase):

    def setUp(self):
        self.role = create_role()

    def test_str(self):
        self.assertEqual(str(self.role), self.role.name)

    def test_to_dict(self):
        ret = self.role.to_dict()

        self.assertEqual(ret['id'], str(self.role.id))
        self.assertEqual(ret['name'], self.role.name)
        self.assertEqual(ret['default'], True if self.role.name == settings.DEFAULT_ROLE else False)
        self.assertEqual(ret['location_level'], str(self.role.location_level.id) if self.role.location_level else None)

    def test_update_defaults(self):
        self.role.group = None
        self.role.auth_amount = None

        self.role._update_defaults()

        self.assertIsInstance(self.role.group, Group)
        self.assertEqual(self.role.group.name, self.role.name)
        self.assertEqual(self.role.auth_amount, 0)

    def test_tenant_not_defaulted_on_save(self):
        tenant = get_or_create_tenant()
        self.assertIsNotNone(self.role.tenant)
        self.role.tenant = None
        self.role.save()
        self.assertIsNone(self.role.tenant)

    def test_related_categories_can_only_be_top_level(self):
        parent = create_single_category()
        child = create_single_category(parent=parent)

        with self.assertRaises(ValidationError):
            self.role.categories.add(child)
            self.role.save()

    def test_categories_not_reqd(self):
        category = Category.objects.get(id=self.role.categories.first().id)
        self.role.categories.remove(category)
        self.role.save()
        self.assertEqual(self.role.categories.count(), 0)


class RolePasswordTests(TestCase):

    def setUp(self):
        self.role = create_role()

    def test_update_password_history_length(self):
        self.assertFalse(self.role.password_history_length)
        self.assertIsInstance(self.role.password_history_length, list)
        # password lengths
        first_pw_len = self.role.password_min_length
        second_pw_len = 10
        third_pw_len = 12
        self.role.password_min_length = second_pw_len
        self.role.save()
        self.assertEqual(self.role.password_history_length, [first_pw_len])
        self.role.password_min_length = third_pw_len
        self.role.save()
        self.assertEqual(
            self.role.password_history_length,
            [first_pw_len, second_pw_len]
        )

    def test_validate_contains_digit(self):
        self.assertFalse(self.role.password_digit_required)
        self.assertTrue(self.role._validate_contains_digit(NO_DIGITS))
        self.assertIsNone(self.role.run_password_validators(NO_DIGITS))

        self.role.password_digit_required = True
        self.role.save()

        self.assertFalse(self.role._validate_contains_digit(NO_DIGITS))
        self.assertTrue(self.role._validate_contains_digit(DIGITS))
        with self.assertRaises(ValidationError):
            self.role.run_password_validators(NO_DIGITS)

    def test_validate_contains_upper(self):
        self.assertFalse(self.role.password_upper_char_required)
        self.assertTrue(self.role._validate_contains_upper_char(UPPER_CHARS))
        self.assertIsNone(self.role.run_password_validators(NO_UPPER_CHARS))

        self.role.password_upper_char_required = True
        self.role.save()

        self.assertFalse(self.role._validate_contains_upper_char(NO_UPPER_CHARS))
        self.assertTrue(self.role._validate_contains_upper_char(UPPER_CHARS))
        with self.assertRaises(ValidationError):
            self.role.run_password_validators(NO_UPPER_CHARS)

    def test_validate_contains_lower(self):
        self.assertFalse(self.role.password_lower_char_required)
        self.assertTrue(self.role._validate_contains_lower_char(LOWER_CHARS))
        self.assertIsNone(self.role.run_password_validators(NO_LOWER_CHARS))

        self.role.password_lower_char_required = True
        self.role.save()

        self.assertFalse(self.role._validate_contains_lower_char(NO_LOWER_CHARS))
        self.assertTrue(self.role._validate_contains_lower_char(LOWER_CHARS))
        with self.assertRaises(ValidationError):
            self.role.run_password_validators(NO_LOWER_CHARS)

    def test_validate_contains_special(self):
        self.assertFalse(self.role.password_special_char_required)
        self.assertTrue(self.role._validate_contains_special_char(SPECIAL_CHARS))
        self.assertIsNone(self.role.run_password_validators(NO_SPECIAL_CHARS))

        self.role.password_special_char_required = True
        self.role.save()

        self.assertFalse(self.role._validate_contains_special_char(NO_SPECIAL_CHARS))
        self.assertTrue(self.role._validate_contains_special_char(SPECIAL_CHARS))
        with self.assertRaises(ValidationError):
            self.role.run_password_validators(NO_SPECIAL_CHARS)


### PERSON STATUS

class PersonStatusManagerTests(TestCase):

    def setUp(self):
        self.status = create_default(PersonStatus)

    def test_default(self):
        default = PersonStatus.objects.default()
        self.assertIsInstance(default, PersonStatus)
        self.assertEqual(default.name, self.status.name)


class PersonStatusTests(TestCase):

    def test_manager(self):
        self.assertIsInstance(PersonStatus.objects, DefaultNameManager)

    def test_meta__verbose_name_plural(self):
        status = mommy.make(PersonStatus)
        self.assertEqual(status._meta.verbose_name_plural, 'Person statuses')


### PERSON

class PersonTests(TestCase):

    def setUp(self):
        create_locations()
        self.password = PASSWORD
        self.person = create_single_person()
        create_default(PersonStatus)
        self.person_default_status = PersonStatus.objects.default()

    def test_person_is_user_subclass(self):
        self.assertIsInstance(self.person, AbstractUser)

    def test_emails_filtering(self):
        email_one = create_contact(Email, self.person)
        email_two = create_contact(Email, self.person)

        self.assertNotEqual(email_one.type, email_two.type)
        self.assertEqual(self.person.emails.count(), 2)
        self.assertEqual(self.person.emails.filter(type=email_one.type).count(), 1)
        self.assertEqual(self.person.emails.filter(type__name=email_one.type.name).count(), 1)

    def test_update_defaults(self):
        self.person.status = None
        self.person.auth_amount = None
        self.person.auth_currency = None
        self.person.locale = None
        self.person.password_expire_date = None
        self.person.middle_initial = 'A'

        self.person._update_defaults()

        self.assertEqual(self.person.status, self.person_default_status)
        self.assertEqual(self.person.locale, Locale.objects.system_default())
        self.assertIsNotNone(self.person.password_expire_date)
        self.assertEqual(self.person.fullname, self.person.get_full_name())

    def test_update_defaults__not_defaulted_if_value(self):
        status = mommy.make(PersonStatus)
        auth_amount = create_role().auth_amount
        auth_currency = Currency.objects.default()
        locale = mommy.make(Locale)
        today = localtime(now()).date
        # init person
        self.person.status = status
        self.person.auth_amount = auth_amount
        self.person.auth_currency = auth_currency
        self.person.locale = locale
        self.person.password_expire_date = today
        self.person.middle_initial = 'A'

        self.person._update_defaults()

        self.assertEqual(self.person.status, status)
        self.assertEqual(self.person.auth_amount, auth_amount)
        self.assertEqual(self.person.auth_currency, auth_currency)
        self.assertEqual(self.person.locale, locale)
        self.assertEqual(self.person.password_expire_date, today)
        self.assertEqual(self.person.fullname, self.person.get_full_name())

    def test_get_fullname(self):
        self.person.first_name = 'Clark'
        self.person.middle_initial = 'A'
        self.person.last_name = 'Kent'
        self.person.save()

        ret = self.person.get_full_name()

        self.assertEqual(ret, 'Clark A. Kent')

    def test_get_fullname__no_middle_initial(self):
        self.person.first_name = 'Clark'
        self.person.middle_initial = None
        self.person.last_name = 'Kent'
        self.person.save()

        ret = self.person.get_full_name()

        self.assertEqual(ret, 'Clark Kent')

    def test_formatted_middle_initial(self):
        mid_init = "Y"
        self.person.middle_initial = mid_init
        self.person.save()

        ret = self.person.formatted_middle_initial

        self.assertEqual(ret, "Y.")

    def test_formatted_middle_initial__is_none(self):
        self.person.middle_initial = None
        self.person.save()

        ret = self.person.formatted_middle_initial

        self.assertIsNone(ret)

    def test_password_expire_date(self):
        self.assertIsInstance(self.person._password_expire_date, date)

    def test_validate_locations(self):
        self.person._validate_locations()
        invalid_location = Location.objects.exclude(
                location_level=self.person.role.location_level).first()
        self.person.locations.add(invalid_location)
        with self.assertRaises(ValidationError):
            self.person.save()

    def test_foreignkeys(self):
        self.assertIsInstance(self.person.status, PersonStatus)
        self.assertIsInstance(self.person.role, Role)

    def test_create(self):
        self.assertIsInstance(self.person, Person)

    def test_no_first_or_last_names(self):
        # We're not going to require `first_name` or `last_name` and that's fine.
        self.person.first_name = ''
        self.person.last_name = ''
        self.person.save()
        self.person = Person.objects.get(pk=self.person.pk)
        self.assertIsInstance(self.person, Person)
        self.assertEqual(self.person.first_name, '')

    def test_delete(self):
        self.assertEqual(Person.objects_all.count(), 1)
        self.assertFalse(self.person.deleted)
        self.person.delete()
        self.assertTrue(self.person.deleted)
        self.assertEqual(Person.objects_all.count(), 1)
        self.assertEqual(Person.objects.count(), 0)

    def test_delete_override(self):
        self.person.delete(override=True)
        self.assertEqual(Person.objects.count(), 0)

    def test_group(self):
        # The Person is still in one Group even after changing Roles
        role = Role.objects.first()
        role2 = create_role()
        person = mommy.make(Person, role=role)
        self.assertEqual(person.groups.count(), 1)
        # Change Role
        person.role = role2
        person.save()
        person = Person.objects.get(id=person.id)
        self.assertEqual(person.groups.count(), 1)

    def test_to_simple_dict(self):
        ret = self.person.to_simple_dict()
        self.assertEqual(len(ret), 4)
        self.assertEqual(ret['id'], str(self.person.id))

    def test_get_locale_user(self):
        # setup
        default_locale = Locale.objects.system_default()
        person_locale = Locale.objects.exclude(id=default_locale.id).first()
        # Confirm that the ``system_default`` is not equal to the Locale
        # that we are about to assign to the ``Person``
        self.assertNotEqual(default_locale, person_locale)
        Person.objects.filter(pk=self.person.id).update(locale=person_locale)

        # ``person.to_dict(_)`` will return the ``person.locale`` first
        # if it exists, not ``person._get_locale``
        self.assertEqual(
            self.person.to_dict(None)['locale'],
            str(self.person.locale.id)
        )

    def test_get_locale_accept_language_header(self):
        self.assertIn(
                self.person._get_locale('en;q=0.9,zh,zh-ch;q=.3'),
                [str(x) for x in Locale.objects.values_list('id', flat=True)]
                )

    def test_get_locale_unrecognized_accept_language_header(self):
        self.assertIn(
                self.person._get_locale('zzzz;q=0.9'),
                [str(x) for x in Locale.objects.values_list('id', flat=True)]
                )

    def test_to_dict_location(self):
        dict_person = self.person.to_dict(None)
        self.assertEqual(dict_person['locations'][0]['id'], str(self.person.locations.first().id))
        self.assertEqual(dict_person['locations'][0]['status_fk'], str(self.person.locations.first().status.id))
        self.assertEqual(dict_person['locations'][0]['location_level'], str(self.person.locations.first().location_level.id))
        self.assertEqual(dict_person['locations'][0]['number'], self.person.locations.first().number)
        self.assertEqual(dict_person['locations'][0]['name'], self.person.locations.first().name)

    def test_all_locations_and_children(self):
        """
        Tests that a full Location object is being returned, which will later
        be used by a DRF serializer in the Person-Current Bootstrapped data.
        """
        data = self.person.all_locations_and_children()
        self.assertIsInstance(data[0], dict)
        db_location = Location.objects.get(id=data[0]['id'])
        self.assertEqual(str(db_location.id), data[0]['id'])
        self.assertEqual(db_location.name, data[0]['name'])
        self.assertEqual(str(db_location.location_level.id), data[0]['location_level'])
        self.assertEqual(str(db_location.status.id), data[0]['status'])

    def test_categories(self):
        # also confirms no child categories are being returned
        category = self.person.role.categories.first()
        create_single_category(parent=category)

        data = self.person.categories()

        self.assertEqual(1, len(data))
        self.assertIsInstance(data[0], dict)
        db_category = Category.objects.get(id=data[0]['id'])
        self.assertEqual(str(db_category.id), data[0]['id'])
        self.assertEqual(db_category.name, data[0]['name'])

    def test_has_top_level_location(self):
        person = create_single_person()
        top_location = Location.objects.create_top_level()
        person.locations.add(top_location)

        # add
        self.assertTrue(person.has_top_level_location)

        # remove
        person.locations.remove(top_location)
        self.assertFalse(person.has_top_level_location)


### PASSWORD

class PersonPasswordHistoryTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_initial(self):
        self.assertEqual(len(self.person.password_history), 1)

    def test_new_password(self):
        self.person.set_password('new')
        self.person.save()
        self.assertEqual(len(self.person.password_history), 2)

    def test_repeat_password(self):
        self.person.set_password('new')
        self.person.save()
        self.assertEqual(len(self.person.password_history), 2)
        with self.assertRaises(ValidationError):
            self.person.set_password('new')
        self.assertEqual(len(self.person.password_history), 2)

    def test_max_passwords_stored(self):
        for x in range(settings.MAX_PASSWORDS_STORED+1):
            self.person.password_history.append(create._generate_chars())
        self.person.save()
        self.assertEqual(
            len(self.person.password_history),
            settings.MAX_PASSWORDS_STORED
        )

    def test_password_change(self):
        init_password_change = self.person.password_change
        new_password = create._generate_chars()
        self.person.set_password(new_password)
        post_password_change = self.person.password_change
        self.assertNotEqual(
            init_password_change,
            post_password_change
        )

class PersonManagerTests(TestCase):

    def setUp(self):
        create_person()
        create_person()

    def test_search_multi_username(self):
        search = Person.objects.first().username
        raw_qs_count = Person.objects.filter(
                Q(username__icontains=search)
            ).count()

        ret = Person.objects.search_multi(keyword=search).count()

        self.assertEqual(ret, raw_qs_count)
        self.assertEqual(ret, 1)

    def test_search_multi_username(self):
        search = Person.objects.first().fullname
        raw_qs_count = Person.objects.filter(
                Q(fullname__icontains=search)
            ).count()

        ret = Person.objects.search_multi(keyword=search).count()

        self.assertEqual(ret, raw_qs_count)
        self.assertEqual(ret, 1)

    def test_search_multi_title(self):
        person = Person.objects.first()
        person.title = 'another title'
        person.save()
        search = 'another title'
        raw_qs_count = Person.objects.filter(
                Q(title__icontains=search)
            ).count()

        ret = Person.objects.search_multi(keyword=search).count()

        self.assertEqual(ret, raw_qs_count)
        self.assertEqual(ret, 1)

    def test_search_multi_role__name(self):
        search = Person.objects.first().role.name
        raw_qs_count = Person.objects.filter(
                Q(role__name__icontains=search)
            ).count()

        ret = Person.objects.search_multi(keyword=search).count()

        self.assertEqual(ret, raw_qs_count)
        self.assertEqual(ret, 1)
