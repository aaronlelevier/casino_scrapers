from django.test import TestCase
from django.contrib.auth.models import AbstractUser, Group

from model_mommy import mommy

from person.models import Person, PersonStatus, Role
from person.tests.factory import PASSWORD, create_person, create_role


class RoleTests(TestCase):

    def setUp(self):
        self.role = create_role()

    def test_group(self):
        self.assertIsInstance(self.role.group, Group)

    def test_name(self):
        self.assertEqual(self.role.group.name, self.role.name)


class PersonStatusManagerTests(TestCase):

    def test_default(self):
        default = PersonStatus.objects.default()
        self.assertIsInstance(default, PersonStatus)


class PersonStatusTests(TestCase):

    def test_create(self):
        ps = mommy.make(PersonStatus)
        self.assertIsInstance(ps, PersonStatus)


class PersonManagerTests(TestCase):

    def setUp(self):
        self.person = create_person()
        self.person_del = create_person()
        self.person_del.delete()

    def test_objects(self):
        # filter out deleted records by default
        self.assertEqual(Person.objects.count(), 1)

    def test_objects_all(self):
        self.assertEqual(Person.objects_all.count(), 2)

    def test_create_user(self):
        people_count = Person.objects.count()
        role = create_role()
        person = Person.objects.create_user('myusername', 'myemail@mail.com',
            'password', role=role)
        self.assertEqual(Person.objects.count(), people_count+1)


class PersonTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_person_is_user_subclass(self):
        self.assertIsInstance(self.person, AbstractUser)

    def test_person_defaults(self):
        self.assertTrue(self.person.accept_assign)

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
        # should create a PersonStatus and default it
        self.assertEqual(self.person.status, PersonStatus.objects.default())

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