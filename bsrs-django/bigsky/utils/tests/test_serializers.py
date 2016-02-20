import copy
import json
import uuid

from rest_framework.test import APITestCase

from generic.models import Setting
from generic.tests.factory import create_general_setting
from generic.serializers import SettingSerializer
from generic.settings import DEFAULT_GENERAL_SETTINGS
from person.models import Role
from person.serializers import RoleCreateSerializer
from person.settings import DEFAULT_ROLE_SETTINGS
from person.tests.factory import create_role
from person.tests.mixins import RoleSetupMixin


class SettingSerializerMixinTests(RoleSetupMixin, APITestCase):

    def setUp(self):
        super(SettingSerializerMixinTests, self).setUp()
        self.setting = create_general_setting()
        serializer = SettingSerializer(self.setting)
        orig_data = serializer.data
        self.setting_data = copy.copy(orig_data)
        # orig values
        self.welcome_text = 'Welcome'

    # def test_update_non_inherited(self):
    #     # init detail
    #     response = self.client.get('/api/admin/settings/{}/'.format(self.setting.id))
    #     data = json.loads(response.content.decode('utf8'))
    #     self.assertEqual(data['settings']['welcome_text']['value'], DEFAULT_GENERAL_SETTINGS['welcome_text']['value'])
    #     self.assertFalse(data['settings']['welcome_text']['inherited'])
    #     self.assertEqual(data['settings']['welcome_text']['inherited_from'], DEFAULT_GENERAL_SETTINGS['welcome_text']['inherited_from'])
    #     self.assertIsNone(data['settings']['welcome_text']['inherited_value'])

    #     # update 'welcome_text'
    #     welcome_text = 'hey yo'
    #     self.setting_data['settings'] = {'welcome_text':  welcome_text}
    #     response = self.client.put('/api/admin/settings/{}/'.format(self.setting.id), self.setting_data, format='json')
    #     self.assertEqual(response.status_code, 200)
    #     data = json.loads(response.content.decode('utf8'))
    #     self.assertEqual(data['settings']['welcome_text']['value'], welcome_text)

    #     # detail response (after update)
    #     response = self.client.get('/api/admin/settings/{}/'.format(self.setting.id))
    #     self.assertEqual(data['settings']['welcome_text']['value'], welcome_text)
    #     self.assertFalse(data['settings']['welcome_text']['inherited'])
    #     self.assertEqual(data['settings']['welcome_text']['inherited_from'], DEFAULT_GENERAL_SETTINGS['welcome_text']['inherited_from'])
    #     self.assertIsNone(data['settings']['welcome_text']['inherited_value'])

    # def test_update_inherited_and_overwrite(self):
    #     role = create_role()
    #     # init detail
    #     response = self.client.get('/api/admin/roles/{}/'.format(self.role.id))
    #     data = json.loads(response.content.decode('utf8'))
    #     self.assertIsNone(data['settings']['welcome_text']['value'])
    #     self.assertTrue(data['settings']['welcome_text']['inherited'])
    #     self.assertEqual(data['settings']['welcome_text']['inherited_from'], DEFAULT_GENERAL_SETTINGS['welcome_text']['inherited_from'])
    #     self.assertEqual(data['settings']['welcome_text']['inherited_value'], self.welcome_text)

    #     serializer = RoleCreateSerializer(role)
    #     role_data = serializer.data
    #     welcome_text = 'hey foo'
    #     role_data['settings'] = {'welcome_text': welcome_text}
    #     response = self.client.put('/api/admin/roles/{}/'.format(role.id), role_data, format='json')

    #     self.assertEqual(response.status_code, 200)
    #     response = self.client.get('/api/admin/roles/{}/'.format(role.id))
    #     data = json.loads(response.content.decode('utf8'))
    #     self.assertEqual(data['settings']['welcome_text']['value'], welcome_text)
    #     self.assertFalse(data['settings']['welcome_text']['inherited'])
    #     self.assertEqual(data['settings']['welcome_text']['inherited_from'], DEFAULT_ROLE_SETTINGS['create_all']['inherited_from'])
    #     self.assertIsNone(data['settings']['welcome_text']['inherited_value'])

    def test_update_inherited_setting_and_inheritor_shows_update(self):
        # init detail
        role = create_role()
        response = self.client.get('/api/admin/roles/{}/'.format(role.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIsNone(data['settings']['welcome_text']['value'])
        self.assertTrue(data['settings']['welcome_text']['inherited'])
        self.assertEqual(data['settings']['welcome_text']['inherited_from'], DEFAULT_GENERAL_SETTINGS['welcome_text']['inherited_from'])
        self.assertEqual(data['settings']['welcome_text']['inherited_value'], self.welcome_text)

        # update 'welcome_text' on 'general' settings
        welcome_text = 'hey yo'
        self.setting_data['settings'] = {'welcome_text':  welcome_text}
        response = self.client.put('/api/admin/settings/{}/'.format(self.setting.id), self.setting_data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['settings']['welcome_text']['value'], welcome_text)
        self.assertEqual(Setting.objects.first().settings['welcome_text']['value'], welcome_text)

        # detail 'general' response (after update)
        response = self.client.get('/api/admin/settings/{}/'.format(self.setting.id))
        self.assertEqual(data['settings']['welcome_text']['value'], welcome_text)
        self.assertFalse(data['settings']['welcome_text']['inherited'])
        self.assertEqual(data['settings']['welcome_text']['inherited_from'], DEFAULT_GENERAL_SETTINGS['welcome_text']['inherited_from'])
        self.assertIsNone(data['settings']['welcome_text']['inherited_value'])

        # 'role' reflects change
        response = self.client.get('/api/admin/roles/{}/'.format(role.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIsNone(data['settings']['welcome_text']['value'])
        self.assertTrue(data['settings']['welcome_text']['inherited'])
        self.assertEqual(data['settings']['welcome_text']['inherited_from'], 'general')
        self.assertEqual(data['settings']['welcome_text']['inherited_value'], welcome_text)
