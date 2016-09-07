from mock import patch

from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from django.contrib.auth.models import ContentType, Permission
from django.core.exceptions import ObjectDoesNotExist

from model_mommy import mommy

from contact.models import Country
from location.models import LocationType
from person.models import Person, PersonQuerySet
from person.tests.factory import create_single_person, create_role
from utils import create
from utils.exceptions import QuerySetClassNotDefined
from utils.models import Tester, TesterManager
from utils.permissions import perms_map


class BaseManagerTests(TestCase):

    def setUp(self):
        self.person = create_single_person('b')
        self.person_two = create_single_person('a')

    def test_filter_export_data(self):
        query_params = {'username': self.person.username}
        fields = Person.EXPORT_FIELDS

        ret = Person.objects.filter_export_data(query_params)

        self.assertIsInstance(ret, PersonQuerySet)
        self.assertEqual(ret.count(), 1)
        self.assertEqual(ret[0].id, self.person.id)
        self.assertEqual(ret[0].username, self.person.username)

    def test_filter_export_data__none_field_arg(self):
        query_params = {'_': 'foo'}

        ret = Person.objects.filter_export_data(query_params)

        self.assertIsInstance(ret, PersonQuerySet)
        self.assertEqual(ret.count(), Person.objects.count())

    @patch("person.models.PersonQuerySet.search_multi")
    def test_filter_export_data__search(self, mock_func):
        query_params = {'search': 'a'}

        Person.objects.filter_export_data(query_params)

        self.assertEqual(mock_func.call_args[0][0], 'a')

    def test_filter_export_data__ordering(self):
        self.assertTrue(self.person_two.username < self.person.username)
        query_params = {'ordering': ['username']}

        ret = Person.objects.filter_export_data(query_params)

        self.assertEqual(ret.count(), 2)
        self.assertEqual(ret[0].username, self.person_two.username)
        self.assertEqual(ret[1].username, self.person.username)


class BaseModelTests(TestCase):

    def setUp(self):
        # default ``objects`` model manager should only
        # return non-deleted objects
        self.t_del = mommy.make(Tester, deleted=timezone.now())
        self.t_ok = mommy.make(Tester)

    def test_objects(self):
        self.assertEqual(Tester.objects.count(), 1)

    def test_objects_all(self):
        self.assertEqual(Tester.objects_all.count(), 2)

    def test_str(self):
        self.assertEqual(
            str(self.t_ok),
            "id: {t.id}; class: {t.__class__.__name__}; deleted: {t.deleted}".format(t=self.t_ok)
        )

    def test_delete__default(self):
        self.assertIsNone(self.t_ok.deleted)

    def test_delete__soft_delete(self):
        self.t_ok.delete()
        self.assertIsNotNone(self.t_ok.deleted)
        self.assertIsInstance(Tester.objects_all.get(id=self.t_ok.id), Tester)

    def test_delete__hard_delete(self):
        country = mommy.make(Country)
        country.delete(override=True)

        with self.assertRaises(ObjectDoesNotExist):
            Country.objects_all.get(id=country.id)

    def test_to_dict(self):
        self.assertEqual(
            self.t_ok.to_dict(),
            {'id': str(self.t_ok.id)}
        )

    def test_model_fields__explicit(self):
        self.assertEqual(Person.MODEL_FIELDS, ['id', 'username'])

        self.assertEqual(Person.model_fields, Person.MODEL_FIELDS)

    def test_model_fields__all_fields(self):
        # if MODEL_FIELDS isn't set on the Model, then return all fields
        with self.assertRaises(AttributeError):
            Tester.MODEL_FIELDS

        self.assertEqual(
            Tester.export_fields,
            [x.name for x in Tester._meta.get_fields()]
        )

    def test_export_fields__explicit(self):
        self.assertEqual(
            Person.EXPORT_FIELDS,
            ['status_name', 'fullname', 'username', 'title', 'role_name']
        )

        self.assertEqual(Person.export_fields, Person.EXPORT_FIELDS)

    def test_export_fields__all_fields(self):
        # if EXPORT_FIELDS isn't set on the Model, then return all fields
        with self.assertRaises(AttributeError):
            Tester.EXPORT_FIELDS

        self.assertEqual(
            Tester.export_fields,
            [x.name for x in Tester._meta.get_fields()]
        )


class BaseNameModelTests(TestCase):

    def setUp(self):
        self.x = mommy.make(LocationType)

    def test_str(self):
        self.assertEqual(str(self.x), self.x.name)

    def test_to_dict(self):
        self.assertEqual(
            self.x.to_dict(),
            {'id': str(self.x.id), 'name': self.x.name}
        )


class TesterPermissionTests(TestCase):

    def setUp(self):
        self.model_name = Tester.__name__.lower() # returns: 'tester'
        self.ct = ContentType.objects.get(app_label="utils", model=self.model_name)

    def test_perms(self):
        ct = self.ct
        self.assertIsInstance(ct, ContentType)

        # perm doesn't exit yet
        with self.assertRaises(ObjectDoesNotExist):
            Permission.objects.get(content_type=ct, codename='view_{}'.format(self.model_name))

        # create perm
        # VARs
        name = 'Can view {}'.format(ct.name)
        codename = 'view_{}'.format(ct.name)

        # create a single instance to be used in all 3 view types
        for i in perms_map.keys():
            if i in ['HEAD', 'OPTIONS', 'GET']:
                return Permission.objects.create(name=name, codename=codename, content_type=ct)

        self.assertIsInstance(
            Permission.objects.get(content_type=ct, codename='view_{}'.format(self.model_name)),
            Permission
            )


class TesterPermissionAlreadyCreatedTests(TransactionTestCase):

    def test_perms(self):
        self.model_name = Tester._meta.verbose_name.lower() # returns: 'tester'
        self.ct = ContentType.objects.get(app_label="utils", model=self.model_name)

        create._create_model_view_permissions()

        self.assertIsInstance(
            Permission.objects.get(content_type=self.ct, codename='view_{}'.format(self.model_name)),
            Permission
            )


class UpdateTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
        self.role1 = create_role()
        self.role2 = create_role()

    def test_update_model(self):
        new_username = "new_username"
        self.assertNotEqual(self.person.username, new_username)
        self.person = create.update_model(instance=self.person, dict_={'username':new_username})
        self.assertEqual(self.person.username, new_username)
