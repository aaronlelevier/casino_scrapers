import copy
import json
import uuid

from rest_framework.test import APITestCase

from generic.settings import DEFAULT_GENERAL_SETTINGS
from person.models import Role
from person.serializers import RoleCreateSerializer
from person.settings import DEFAULT_ROLE_SETTINGS
from person.tests.factory import create_role
from person.tests.mixins import RoleSetupMixin


class SettingSerializerMixinTests(RoleSetupMixin, APITestCase):

    def test_update_settings_defaults(self):
        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(data['settings']['create_all']['value'], DEFAULT_ROLE_SETTINGS['create_all']['value'])

    def test_update_settings_custom_values(self):
        role = create_role()
        serializer = RoleCreateSerializer(role)
        orig_data = serializer.data
        role_data = copy.copy(orig_data)
        welcome_text = 'hey foo'
        role_data['settings'] = {'welcome_text': welcome_text}

        response = self.client.put('/api/admin/roles/{}/'.format(role.id), role_data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['settings']['welcome_text']['value'], welcome_text)
        self.assertEqual(data['settings']['create_all']['value'], DEFAULT_ROLE_SETTINGS['create_all']['value'])
