import copy
from mock import patch

from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from django.contrib.auth.models import ContentType, Permission
from django.core.exceptions import ObjectDoesNotExist

from model_mommy import mommy

from contact.models import Country
from generic.models import Setting
from generic.settings import DEFAULT_GENERAL_SETTINGS
from generic.tests.factory import create_general_setting
from person.models import PersonStatus, Role
from person.settings import DEFAULT_ROLE_SETTINGS
from person.tests.factory import create_single_person, create_role
from utils import create
from utils.models import Tester, SettingMixin
from utils.permissions import perms_map


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


class BaseNameModelTests(TestCase):

    def setUp(self):
        self.x = mommy.make(Country)

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


class SettingMixinTests(TestCase):

    def setUp(self):
        self.settings = SettingMixin()
        self.maxDiff = None

    def test_get_class_default_settings(self):
        ret = self.settings.get_class_default_settings()
        self.assertEqual({}, ret)

    def test_get_class_default_settings__general(self):
        ret = self.settings.get_class_default_settings('general')
        self.assertEqual(DEFAULT_GENERAL_SETTINGS, ret)

    def test_get_class_default_settings__role(self):
        ret = self.settings.get_class_default_settings('role')
        self.assertEqual(DEFAULT_ROLE_SETTINGS, ret)

    def test_get_class_default_settings__no_memory_leak(self):
        ret = self.settings.get_class_default_settings('general')
        ret['foo'] = 'bar'

        ret_two = self.settings.get_class_default_settings('general')

        self.assertNotEqual(ret, ret_two)

    def test_get_class_combined_settings_full(self):
        raw_ret = {}
        raw_ret.update(DEFAULT_GENERAL_SETTINGS)
        raw_ret.update(DEFAULT_ROLE_SETTINGS)

        ret = self.settings.get_class_combined_settings_full('general', DEFAULT_ROLE_SETTINGS)

        self.assertEqual(ret, raw_ret)

    def test_get_combined_settings_file__inherited(self):
        k = 'welcome_text'
        with patch.dict(DEFAULT_GENERAL_SETTINGS, {k: {'value': "Welcome", 'type': 'str', 'inherited_from': 'general'}}, clear=True):
            ret = self.settings.get_class_combined_settings('general', DEFAULT_ROLE_SETTINGS)

            self.assertIsNone(ret['welcome_text']['value'])
            self.assertEqual(ret['welcome_text']['inherited_value'], 'Welcome')
            self.assertEqual(ret['welcome_text']['inherited_from'], 'general')

    def test_get_combined_settings_file__override(self):
        k = 'welcome_text'
        override  = {k: {'value': "foo", 'type': 'str', 'inherited_from': 'override'}}

        with patch.dict(DEFAULT_GENERAL_SETTINGS, {k: {'value': "Welcome", 'type': 'str', 'inherited_from': 'general'}}, clear=True):
            ret = self.settings.get_class_combined_settings('general', override)

        self.assertEqual(ret['welcome_text']['inherited_value'], 'Welcome')
        self.assertEqual(ret['welcome_text']['value'], 'foo')
        self.assertEqual(ret['welcome_text']['inherited_from'], 'general')

    def test_get_combined_settings_file__append(self):
        k = 'welcome_text'
        override  = {'create_all': {'value': "foo", 'type': 'str', 'inherited_from': 'override'}}

        with patch.dict(DEFAULT_GENERAL_SETTINGS, {k: {'value': "Welcome", 'type': 'str', 'inherited_from': 'general'}}, clear=True):
            ret = self.settings.get_class_combined_settings('general', override)

        # not overrode
        self.assertEqual(ret['welcome_text']['inherited_value'], 'Welcome')
        self.assertIsNone(ret['welcome_text']['value'])
        self.assertEqual(ret['welcome_text']['inherited_from'], 'general')
        # appended
        self.assertEqual(ret['create_all']['value'], 'foo')
        self.assertIsNone(ret['create_all']['inherited_value'])
        self.assertEqual(ret['create_all']['inherited_from'], 'override')

    def test_combine_overrides(self):
        settings = [{'a':'b'}, {'c':'d'}]
        # raw
        all_overrides = {}
        for setting in settings:
            all_overrides.update(setting)

        ret = self.settings.combine_overrides(settings)

        self.assertEqual(ret, all_overrides)

    def test_update_overrides__override(self):
        k = 'welcome_text'
        init  = {k: {'value': 'foo', 'type': 'str', 'inherited_from': 'init'}}
        override  = {k: {'value': "bar", 'type': 'str', 'inherited_from': 'override'}}

        ret = self.settings.update_overrides(init, override)

        self.assertEqual(ret[k]['inherited_value'], 'foo')
        self.assertEqual(ret[k]['value'], 'bar')
        self.assertEqual(ret[k]['inherited_from'], 'init')

    def test_update_overrides__append(self):
        k = 'welcome_text'
        init  = {}
        override  = {k: {'value': "bar", 'type': 'str', 'inherited_from': 'override'}}

        ret = self.settings.update_overrides(init, override)

        self.assertEqual(ret[k]['inherited_value'], None)
        self.assertEqual(ret[k]['value'], 'bar')
        self.assertEqual(ret[k]['inherited_from'], 'override')

    def test_update_overrides__neither(self):
        k = 'welcome_text'
        init  = {k: {'value': "bar", 'type': 'str', 'inherited_from': 'init'}}
        override  = {}

        ret = self.settings.update_overrides(init, override)

        with self.assertRaises(KeyError):
            ret[k]['inherited_value']

        self.assertEqual(ret[k]['value'], init[k]['value'])
        self.assertEqual(ret[k]['inherited_from'], 'init')

    def test_update_non_overrides(self):
        k = 'welcome_text'
        init  = {k: {'value': 'foo', 'type': 'str', 'inherited_from': 'init'}} #{}
        override  = {}

        ret = self.settings.update_non_overrides(init, override)

        self.assertEqual(ret[k]['inherited_value'], 'foo')
        self.assertIsNone(ret[k]['value'])
        self.assertEqual(ret[k]['inherited_from'], 'init')

    def test_get_settings_name(self):
        with self.assertRaises(NotImplementedError):
            SettingMixin.get_settings_name()

    def test_get_all_class_settings(self):
        with self.assertRaises(NotImplementedError):
            self.settings.get_all_class_settings()

    def test_get_all_instance_settings(self):
        with self.assertRaises(NotImplementedError):
            self.settings.get_all_instance_settings()
