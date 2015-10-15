import uuid
import json

from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import ContentType, Permission
from django.core.exceptions import ObjectDoesNotExist

from model_mommy import mommy

from person.models import Role, PersonStatus
from person.tests.factory import create_person, create_role
from translation.models import Locale
from utils import create, choices, helpers
from utils.models import Tester
from utils.permissions import perms_map


class HelperTests(TestCase):

    def test_model_to_json(self):
        role = create_role()
        role_json = helpers.model_to_json(Role)
        role_python = json.loads(role_json)
        self.assertEqual(role_python[0]['id'], str(role.id))

    def test_choices_to_json(self):
        ch_json = helpers.choices_to_json(choices.ROLE_TYPE_CHOICES)
        ch_python = json.loads(ch_json)
        self.assertTrue(ch_python)
        self.assertIsInstance(ch_python, list)

    def test_current_local_default(self):
        self.assertEqual(Locale.objects.count(), 0)
        user = create_person()
        current_locale_json = helpers.current_locale(user)
        current_locale_python = json.loads(current_locale_json)
        self.assertEqual(
            current_locale_python['locale'],
            settings.LANGUAGE_CODE
        )
        self.assertEqual(Locale.objects.count(), 1)

    def test_current_locale_user(self):
        # setup
        locale = Locale.objects.system_default()
        user = create_person()
        user.locale = locale
        user.save()
        # test
        current_locale_json = helpers.current_locale(user)
        current_locale_python = json.loads(current_locale_json)
        self.assertEqual(
            current_locale_python['locale'],
            user.locale.locale
        )


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
        self.model_name = Tester.__name__.lower() # returns: 'tester'
        self.ct = ContentType.objects.get(app_label="utils", model=self.model_name)

        create._create_model_view_permissions()

        self.assertIsInstance(
            Permission.objects.get(content_type=self.ct, codename='view_{}'.format(self.model_name)),
            Permission
            )

        
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


class BaseStatusModelTests(TestCase):

    def test_default(self):
        status = mommy.make(PersonStatus, default=True)
        self.assertIsInstance(PersonStatus.objects.default(), PersonStatus)

    def test_update_non_defaults(self):
        status = mommy.make(PersonStatus, default=True)
        status2 = mommy.make(PersonStatus, default=True)

        PersonStatus.objects.update_non_defaults(id=status.id)
        self.assertTrue(status.default)

        status2 = PersonStatus.objects.get(id=status2.id)
        self.assertFalse(status2.default)