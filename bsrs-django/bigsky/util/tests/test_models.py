import uuid

from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from django.contrib.auth.models import ContentType, Permission
from django.core.exceptions import ObjectDoesNotExist

from model_mommy import mommy

from category.models import CategoryType
from category.serializers import CategoryTypeListSerializer
from person.tests.factory import create_person, create_role
from util import create
from util.models import MainSetting, CustomSetting, Tester
from util.permissions import perms_map


class TesterManagerTests(TestCase):

    def setUp(self):
        # default ``objects`` model manager should only
        # return non-deleted objects
        self.t_del = mommy.make(Tester, deleted=timezone.now())
        self.t_ok = mommy.make(Tester)

    def test_managers(self):
        self.assertEqual(Tester.objects.count(), 1)

    def test_managers_all(self):
        self.assertEqual(Tester.objects_all.count(), 2)


class TesterTests(TestCase):
    # Empty Model to test Base Model Methods

    def setUp(self):
        # default ``objects`` model manager should only
        # return non-deleted objects
        self.t_del = mommy.make(Tester, deleted=timezone.now())
        self.t_ok = mommy.make(Tester)

    def test_create(self):
        # Confirm can pass in the ``uuid`` instead of only auto-generating it
        id = uuid.uuid4()
        tester = mommy.make(Tester, id=id)
        self.assertEqual(str(id), str(tester.id))

    def test_delete(self):
        # can't hide already ``deleted=True`` object, so should have
        # the same object count
        self.t_del.delete()
        self.assertEqual(len(Tester.objects_all.all()), 2)

    def test_delete_real(self):
        self.t_del.delete(override=True)
        self.assertEqual(len(Tester.objects_all.all()), 1)


class TesterPermissionTests(TestCase):

    def setUp(self):
        self.model = Tester.__name__.lower() # returns: 'tester'
        self.ct = ContentType.objects.get(app_label="util", model=self.model)

    def test_perms(self):
        ct = self.ct
        self.assertIsInstance(ct, ContentType)

        # perm doesn't exit yet
        with self.assertRaises(ObjectDoesNotExist):
            Permission.objects.get(content_type=ct, codename='view_{}'.format(self.model))

        # create perm
        # VARs
        name = 'Can view {}'.format(ct.name)
        codename = 'view_{}'.format(ct.name)

        # create a single instance to be used in all 3 view types
        for i in perms_map.keys():
            if i in ['HEAD', 'OPTIONS', 'GET']:
                return Permission.objects.create(name=name, codename=codename, content_type=ct)

        self.assertIsInstance(
            Permission.objects.get(content_type=ct, codename='view_{}'.format(self.model)),
            Permission
            )


class TesterPermissionAlreadyCreatedTests(TransactionTestCase):

    def test_perms(self):
        self.model = Tester.__name__.lower() # returns: 'tester'
        self.ct = ContentType.objects.get(app_label="util", model=self.model)

        create._create_model_view_permissions()

        self.assertIsInstance(
            Permission.objects.get(content_type=self.ct, codename='view_{}'.format(self.model)),
            Permission
            )


class MainSettingTests(TestCase):
    # Only testing one ``Setting` Model b/c they are inheriting
    # from the same Base Model

    def setUp(self):
        self.person = create_person()

    def test_setting(self):
        ct = ContentType.objects.get(app_label='person', model='person')
        s = MainSetting.objects.create(
            content_type=ct,
            object_id=self.person.id,
            content_object=self.person
            )
        self.assertEqual(s.content_object, self.person)


class UpdateTests(TestCase):

    def setUp(self):
        self.person = create_person()
        self.role1 = create_role()
        self.role2 = create_role()

    def test_update_model(self):
        new_username = "new_username"
        self.assertNotEqual(self.person.username, new_username)
        self.person = create.update_model(instance=self.person, dict_={'username':new_username})
        self.assertEqual(self.person.username, new_username)

    def test_serialize_model_to_dict(self):
        ct = mommy.make(CategoryType)
        dict_ = create.serialize_model_to_dict(ct, CategoryTypeListSerializer)
        for k,v in dict_.items():
            self.assertIn(k, CategoryTypeListSerializer.Meta.fields)
            if isinstance(getattr(ct, k), uuid.UUID):
                self.assertEqual(str(getattr(ct, k)), v)
            else:
                self.assertEqual(getattr(ct, k), v)