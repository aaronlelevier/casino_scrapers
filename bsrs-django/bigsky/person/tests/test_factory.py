from mock import patch

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.urlresolvers import reverse
from django.test import TestCase

from model_mommy import mommy

from category.models import LABEL_TRADE
from category.tests.factory import create_single_category, create_categories, REPAIR
from location.models import (Location, LocationLevel, LOCATION_COMPANY, LOCATION_DISTRICT,
    LOCATION_REGION)
from location.tests.factory import (create_location, create_locations,
    create_location_level, create_location_levels, create_top_level_location)
from person.helpers import PermissionInfo
from person.models import Role, Person
from person.tests import factory
from tenant.models import Tenant
from tenant.tests.factory import get_or_create_tenant
from translation.models import Locale
from translation.tests.factory import create_locales


class DistrictManagerFactoryTests(TestCase):

    def setUp(self):
        self.dm = factory.DistrictManager()

    def test_categories(self):
        category = self.dm.repair

        self.assertEqual(self.dm.role.categories.count(), 1)
        self.assertEqual(category, self.dm.role.categories.first())
        self.assertEqual(category.name, REPAIR)
        self.assertEqual(category.label, settings.TOP_LEVEL_CATEGORY_LABEL)
        self.assertEqual(category.subcategory_label, LABEL_TRADE)
        self.assertIsNone(category.parent)
        self.assertEqual(category.children.count(), 0)

    def test_location_level(self):
        location_level = self.dm.location_level

        self.assertEqual(location_level, self.dm.role.location_level)
        self.assertEqual(location_level.name, LOCATION_DISTRICT)
        self.assertIsInstance(location_level.tenant, Tenant)
        self.assertEqual(
            self.dm.location.location_level,
            self.dm.location_level
        )

    def test_role(self):
        self.assertEqual(self.dm.role.location_level, self.dm.location_level)
        self.assertIn(self.dm.repair, self.dm.role.categories.all())

    def test_location(self):
        self.assertEqual(self.dm.location.location_level, self.dm.location_level)

    def test_person(self):
        self.assertEqual(self.dm.person.username, 'district-manager-1')
        self.assertEqual(self.dm.person.role.name, 'district-manager')
        self.assertEqual(self.dm.person.role, self.dm.role)
        self.assertIn(self.dm.location, self.dm.person.locations.all())


class CreateRoleTests(TestCase):

    def test_standard(self):
        init_count = Role.objects.count()
        role = factory.create_role()
        self.assertIsInstance(role, Role)
        self.assertIsInstance(role.tenant, Tenant)
        self.assertEqual(init_count+1, Role.objects.count())
        self.assertEqual(role.location_level.name, LOCATION_REGION)

    def test_with_name(self):
        name = "Admin"
        role = factory.create_role(name=name)
        self.assertIsInstance(role, Role)
        self.assertEqual(role.name, name)

    def test_with_location_level(self):
        location_level = create_location_level(LOCATION_REGION)

        role = factory.create_role(location_level=location_level)

        self.assertEqual(role.location_level.name, location_level.name)

    def test_tenant(self):
        role = factory.create_role()
        self.assertIsInstance(role.location_level.tenant, Tenant)

    def test_explicit_category(self):
        category = create_single_category('foo')
        role = factory.create_role(category=category)

        self.assertEqual(role.categories.count(), 1)
        self.assertEqual(role.categories.first().name, category.name)

    def test_default_category(self):
        role = factory.create_role()

        self.assertEqual(role.categories.count(), 1)


class CreateRolesTests(TestCase):

    def setUp(self):
        create_single_category()
        factory.create_roles()

    def test_count(self):
        self.assertEqual(
            Role.objects.count(),
            LocationLevel.objects.count()
        )

    def test_default_role(self):
        default_role = Role.objects.get(name=settings.DEFAULT_ROLE)
        self.assertEqual(settings.DEFAULT_ROLE, default_role.name)
        self.assertEqual(default_role.location_level, LocationLevel.objects.create_top_level())

    def test_other_roles(self):
        for role in Role.objects.all():
            if role.name == settings.DEFAULT_ROLE:
                self.assertEqual(role.location_level.name, settings.DEFAULT_LOCATION_LEVEL)
            else:
                self.assertNotEqual(role.location_level.name, LOCATION_COMPANY)
                self.assertEqual(role.name, '{}-role'.format(role.location_level.name))

            self.assertEqual(role.categories.count(), 1)

class CreateRolesWithExistingRelatedDataTests(TestCase):

    def test_location_levels_exist(self):
        create_location_levels()
        self.assertEqual(LocationLevel.objects.count(), 5)
        self.assertEqual(Location.objects.count(), 0)
        self.assertEqual(Role.objects.count(), 0)

        factory.create_roles()

        self.assertEqual(LocationLevel.objects.count(), 5)
        self.assertEqual(Location.objects.count(), 0)
        self.assertEqual(Role.objects.count(), 5)
        for ll in LocationLevel.objects.all():
            if ll.name == settings.DEFAULT_LOCATION_LEVEL:
                self.assertIsInstance(Role.objects.get(name=settings.DEFAULT_ROLE), Role)
            else:
                self.assertIsInstance(Role.objects.get(name="{}-role".format(ll.name)), Role)


class CreateSinglePersonTests(TestCase):

    def test_standard(self):
        person = factory.create_single_person()

        self.assertIsInstance(person, Person)
        self.assertIsInstance(person.role.tenant, Tenant)
        self.assertIsInstance(person.locale, Locale)
        # person's location
        self.assertEqual(person.locations.count(), 1)
        location = person.locations.first()
        self.assertEqual(person.role.location_level, location.location_level)

    def test_with_role_and_location(self):
        username = 'bob'
        role = factory.create_role()
        status = factory.create_person_status()
        location = create_location(location_level=role.location_level)

        person = factory.create_single_person('bob', role, location, status=status)

        self.assertIsInstance(person, Person)
        self.assertEqual(person.username, username)
        self.assertEqual(person.role, role)
        self.assertEqual(person.status, status)
        self.assertEqual(person.locations.count(), 1)
        person_location = person.locations.first()
        self.assertEqual(person.role.location_level, person_location.location_level)

    def test_validator_only_role(self):
        """
        ``role`` and ``location`` must both be passed in as "kwargs", or 
        not used. If one or the other is sent, it can lead to validation 
        errors and leaky state on Jenkins.
        """
        role = factory.create_role()

        with self.assertRaises(ValidationError):
            factory.create_single_person(role=role)

    def test_validator_only_location(self):
        """
        ``role`` and ``location`` must both be passed in as "kwargs", or 
        not used. If one or the other is sent, it can lead to validation 
        errors and leaky state on Jenkins.
        """
        location = create_location()

        with self.assertRaises(ValidationError):
            factory.create_single_person(location=location)

    def test_name_generation(self):
        # no name arg
        person = factory.create_single_person()
        self.assertTrue(person.username)
        self.assertTrue(person.first_name)
        self.assertTrue(person.middle_initial)
        self.assertTrue(person.last_name)
        # 'name' as string arg
        name = 'foo'
        person = factory.create_single_person(name=name)
        self.assertEqual(person.username, name)
        self.assertEqual(person.first_name, name)
        self.assertEqual(person.middle_initial, name[:1])
        self.assertEqual(person.last_name, name)
        # name as tuple
        name = ('a', 'b', 'c')
        first_name, middle_initial, last_name = name
        person = factory.create_single_person(name=name)
        self.assertEqual(person.username, first_name)
        self.assertEqual(person.first_name, first_name)
        self.assertEqual(person.middle_initial, middle_initial)
        self.assertEqual(person.last_name, last_name)

    def test_title(self):
        roles = factory.create_roles()
        for role in roles:
            location = create_location(role.location_level)
            person = factory.create_single_person(
                role=role, location=location)
            self.assertNotEqual(person.username, person.title)

    def test_photo(self):
        person = factory.create_single_person()
        self.assertTrue(person.photo.id)
        self.assertTrue(person.photo.image_thumbnail)
        self.assertTrue(person.photo.image_medium)
        self.assertTrue(person.photo.image_full)
        self.assertTrue(person.photo.filename)


class CreatePersonTests(TestCase):

    def test_create_person(self):
        person = factory.create_person()
        self.assertIsInstance(person, Person)

    def test_create_person__with_username(self):
        new_person_name = 'new_person'
        person = factory.create_person(username=new_person_name)
        self.assertIsInstance(person, Person)
        self.assertEqual(person.username, new_person_name)

    def test_create_person__multiple(self):
        # Will `get_or_create` Person Obj, so confirm at least 2 exist
        factory.create_person(_many=5)
        self.assertTrue(Person.objects.count() >= 2)

    def test_create_person__username_with_many_raises_error(self):
        with self.assertRaises(Exception):
            factory.create_person(username='bob', _many=people)

    def test_create_person__related_obj_creates(self):
        person = factory.create_person()
        self.assertIsInstance(person.role, Role)


class UpdateAdminTests(TestCase):

    def setUp(self):
        create_locations()
        create_categories()
        # company
        location_level = LocationLevel.objects.get(name=settings.DEFAULT_LOCATION_LEVEL)
        factory.create_role(name=settings.DEFAULT_ROLE, location_level=location_level)

    def test_update_login_person(self):
        person = factory.create_person()
        new_password = 'tango'

        factory.update_login_person(person, new_password=new_password)

        self.assertTrue(person.is_superuser)
        self.assertTrue(person.is_staff)
        response = self.client.post(reverse('login'), {'username': person.username,
            'password': new_password})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.session['_auth_user_id'], str(person.id))

    @patch("person.tests.factory.grant_all_permissions")
    def test_update_admin(self, mock_func):
        top_level_location = create_top_level_location()
        top_level_location_level = create_location_level()
        create_locales()
        person = factory.create_single_person()

        factory.update_admin(person)

        # django-admin access attrs
        self.assertTrue(person.is_staff)
        self.assertTrue(person.is_superuser)
        # Locations - 'admin' belongs to the top level
        person_locations = person.locations.values_list('id', flat=True)
        self.assertIn(top_level_location.id, person_locations)
        self.assertEqual(person.role.location_level, top_level_location_level)
        self.assertFalse(person.role.categories.all())
        self.assertTrue(mock_func.called)
        self.assertEqual(mock_func.call_args[0][0], person)

    def test_grant_all_permissions(self):
        person = factory.create_single_person()
        self.assertEqual(len(person.role.permissions), 0)

        factory.grant_all_permissions(person)

        self.assertEqual(len(person.role.permissions), 25)
        self.assertEqual(
            sorted(person.role.permissions.keys()),
            sorted(PermissionInfo.ALL_DEFAULTS.keys()))

    def test_add_ph_and_email(self):
        person = factory.create_single_person()
        self.assertEqual(person.emails.count(), 0)
        self.assertEqual(person.phone_numbers.count(), 0)

        factory.add_ph_and_email(person)

        # email
        self.assertEqual(person.emails.count(), 1)
        email = person.emails.first()
        self.assertEqual(email.email, settings.EMAIL_HOST_USER)
        # ph
        self.assertEqual(person.phone_numbers.count(), 1)
        ph = person.phone_numbers.first()
        self.assertEqual(ph.number, settings.DEFAULT_PHONE_NUMBER)

    def test_update_locale(self):
        default_locale = 'en'
        mommy.make(Locale, locale=default_locale)
        locale = mommy.make(Locale)
        person = factory.create_single_person()
        person.locale = locale
        person.save()
        self.assertNotEqual(person.locale.locale, default_locale)

        factory.update_locale(person)

        self.assertEqual(person.locale.locale, default_locale)

    def test_remove_any_categories(self):
        person = factory.create_single_person()
        self.assertTrue(person.role.categories.all())

        factory.remove_any_categories(person)

        self.assertFalse(person.role.categories.all())

    def test_remove_all_locations(self):
        create_locations()
        person = factory.create_single_person()

        factory.remove_all_locations(person)

        self.assertEqual(person.locations.count(), 0)


class CreateAllPeopleTests(TestCase):

    def test_create_all_people(self):
        # the ``create_all_people`` function should only create objects in the 
        # ``person`` app, not any extra Locations
        create_locations()
        self.assertEqual(LocationLevel.objects.count(), 5)
        self.assertEqual(Location.objects.count(), 7)
        create_locales()
        factory.create_person_statuses()
        init_location_count = Location.objects.count()

        factory.create_all_people()

        self.assertEqual(LocationLevel.objects.count(), 5)
        self.assertEqual(Location.objects.count(), 7)
        # people
        people = Person.objects.all()
        self.assertEqual(people.count(), 200)
        self.assertTrue(people[0].employee_id)
        # Roles
        self.assertEqual(Role.objects.count(), 5)
        self.assertTrue(Role.objects.filter(name=settings.DEFAULT_ROLE).exists())
        # At least some people are assigned to Location(s)
        self.assertTrue(Person.objects.exclude(locations__isnull=True))
        # Locations
        post_location_count = Location.objects.count()
        self.assertEqual(init_location_count, post_location_count)
        # admin person got setup
        admin = Person.objects.get(username='admin')
        self.assertTrue(admin.is_superuser)

        x = False
        for person in Person.objects.all():
            try:
                person.save()
            except ValidationError:
                x = True
            self.assertIsInstance(person, Person)

        if x:
            self.fail()


class CreateOtherTenantFactoryTests(TestCase):

    def setUp(self):
        self.tenant = get_or_create_tenant()
        self.role = factory.create_role()
        self.location_level = create_location_level()

    def test_create_other_role(self):
        ret = factory.create_other_role()

        self.assertIsInstance(ret, Role)
        self.assertNotEqual(ret.tenant, self.tenant)
        self.assertNotEqual(ret.tenant, self.role.tenant)
        self.assertNotEqual(ret.tenant, self.location_level.tenant)

    def test_create_other_person(self):
        ret = factory.create_other_person()

        self.assertIsInstance(ret, Person)
        self.assertNotEqual(ret.role.tenant, self.tenant)
        self.assertEqual(ret.locations.count(), 1)
        other_location = ret.locations.first()
        self.assertNotEqual(other_location.location_level.tenant,
                            self.tenant)
