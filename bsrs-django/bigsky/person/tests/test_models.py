from datetime import date

from django.test import TestCase
from django.conf import settings
from django.contrib.auth.models import AbstractUser, Group
from django.core.exceptions import ValidationError

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_single_category
from location.models import Location
from location.tests.factory import create_locations
from person.models import Person, PersonStatus, Role
from person.settings import DEFAULT_ROLE_SETTINGS
from person.tests.factory import PASSWORD, create_person, create_role, create_single_person
from translation.models import Locale
from translation.tests.factory import create_locales
from utils import create
from utils.tests.test_validators import (DIGITS, NO_DIGITS, UPPER_CHARS, NO_UPPER_CHARS,
    LOWER_CHARS, NO_LOWER_CHARS, SPECIAL_CHARS, NO_SPECIAL_CHARS)


### ROLE

class RoleTests(TestCase):

    def setUp(self):
        self.role = create_role()

    def test_group(self):
        self.assertIsInstance(self.role.group, Group)

    def test_name(self):
        self.assertEqual(self.role.group.name, self.role.name)

    def test_to_dict_location_level (self):
        self.assertEqual(
            self.role.to_dict()["location_level"],
            str(self.role.location_level.id)
        )

    def test_related_categories_can_only_be_top_level(self):
        parent = create_single_category()
        child = create_single_category(parent=parent)

        with self.assertRaises(ValidationError):
            self.role.categories.add(child)
            self.role.save()

    def test_settings_default(self):
        role = create_role()
        self.assertEqual(role.settings, DEFAULT_ROLE_SETTINGS)

    def test_get_combined_settings_file(self):
        raw_combined_settings = Role.get_class_combined_settings('general', self.role.settings)

        ret = self.role.get_all_instance_settings()

        self.assertEqual(ret, raw_combined_settings)


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

    def test_get_or_create_default(self):
        default, created = PersonStatus.objects.get_or_create_default()
        self.assertIsInstance(default, PersonStatus)
        self.assertTrue(created)


class PersonStatusTests(TestCase):

    def test_save_enforces_default(self):
        for x in range(3):
            status = mommy.make(PersonStatus, default=True)
        self.assertTrue(status.default)
        self.assertEqual(PersonStatus.objects.filter(default=True).count(), 1)


### PERSON

class PersonManagerTests(TestCase):

    def setUp(self):
        create_locations()
        self.person = create_person()
        self.person_del = create_person()
        self.person_del.delete()

    def test_objects(self):
        # filter out deleted records by default
        self.assertEqual(Person.objects.count(), 1)

    def test_objects_all(self):
        self.assertEqual(Person.objects_all.count(), 2)


class PersonTests(TestCase):

    def setUp(self):
        create_locations()
        self.password = PASSWORD
        self.person = create_single_person()

    def test_person_is_user_subclass(self):
        self.assertIsInstance(self.person, AbstractUser)

    def test_person_defaults(self):
        self.assertTrue(self.person.accept_assign)

    def test_update_defaults(self):
        self.person.status = None
        self.assertIsNone(self.person.status)
        self.person._update_defaults()
        self.assertIsNotNone(self.person.status)
        self.assertIsNotNone(self.person.password_expire_date)

    def test_fullname(self):
        self.assertEqual(
            self.person.fullname,
            self.person.first_name + ' ' + self.person.last_name
        )
        init_fullname = self.person.first_name + ' ' + self.person.last_name

        self.person.last_name = self.person.last_name+'wat'
        self.person.save()

        self.assertEqual(
            self.person.fullname,
            init_fullname+'wat'
        )

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

    def test_status(self):
        # should create a PersonStatus
        self.assertEqual(self.person.status, PersonStatus.objects.first())

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

    # def test_get_locale_user(self):
    #     # setup
    #     person_locale = Locale.objects.order_by("-name").first()
    #     # Confirm that the ``system_default`` is not equal to the Locale
    #     # that we are about to assign to the ``Person``
    #     self.assertNotEqual(
    #         Locale.objects.system_default(),
    #         person_locale
    #     )
    #     # test
    #     self.person.locale = person_locale
    #     self.person.save()
    #     # ``person.to_dict(_)`` will return the ``person.locale`` first
    #     # if it exists, not ``person._get_locale``
    #     self.assertEqual(
    #         self.person.to_dict(None)['locale'],
    #         str(self.person.locale.id)
    #     )

    def test_get_locale_accept_language_header(self):
        # setup
        self.assertIn(
            self.person._get_locale("es,en-US;q=0.8"),
            [str(x) for x in Locale.objects.values_list('id', flat=True)]
        )

    def test_get_locale_system(self):
        self.assertEqual(
            self.person._get_locale(None),
            str(Locale.objects.system_default().id)
        )

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
