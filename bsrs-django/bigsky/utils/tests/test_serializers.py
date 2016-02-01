import copy
import json
import uuid

from rest_framework.test import APITestCase

from person.models import Role
from person.serializers import RoleCreateSerializer
from person.settings import DEFAULT_ROLE_SETTINGS
from person.tests.factory import create_role
from person.tests.mixins import RoleSetupMixin


class SettingSerializerMixinTests(RoleSetupMixin, APITestCase):

    def test_create__settings(self):
        role_data = {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "settings": {
                "welcome_text": {"value": "Hello world"}
            }
        }

        response = self.client.post('/api/admin/roles/', role_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], role_data['id'])
        self.assertEqual(data['settings']['welcome_text']['value'], role_data['settings']['welcome_text']['value'])
        self.assertEqual(data['settings']['welcome_text']['type'], 'str')
        self.assertEqual(data['settings']['welcome_text']['required'], False)
        # other defaults should be returned as well
        self.assertEqual(data['settings']['create_all']['value'], DEFAULT_ROLE_SETTINGS['create_all']['value'])
        self.assertEqual(data['settings']['create_all']['type'], 'bool')
        self.assertEqual(data['settings']['create_all']['required'], True)
        self.assertEqual(data['settings']['modules']['value'], DEFAULT_ROLE_SETTINGS['modules']['value'])
        self.assertEqual(data['settings']['modules']['type'], 'list')
        self.assertEqual(data['settings']['modules']['required'], True)
        self.assertEqual(data['settings']['login_grace']['value'], DEFAULT_ROLE_SETTINGS['login_grace']['value'])
        self.assertEqual(data['settings']['login_grace']['type'], 'int')
        self.assertEqual(data['settings']['login_grace']['required'], True)

    def test_create__settings__required_value_missing(self):
        """
        If the a required settings value is missing, use the default setting.
        """
        role_data = {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "settings": {
                "create_all": {}
            }
        }

        response = self.client.post('/api/admin/roles/', role_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], role_data['id'])
        role = Role.objects.get(id=role_data['id'])
        self.assertEqual(role.settings['create_all']['value'], DEFAULT_ROLE_SETTINGS['create_all']['value'])
        self.assertEqual(role.settings['create_all']['type'], 'bool')
        self.assertEqual(role.settings['create_all']['required'], True)

    def test_update_settings_defaults(self):
        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(data['settings']['welcome_text']['value'], DEFAULT_ROLE_SETTINGS['welcome_text']['value'])
        self.assertEqual(data['settings']['create_all']['value'], DEFAULT_ROLE_SETTINGS['create_all']['value'])
        self.assertEqual(data['settings']['modules']['value'], DEFAULT_ROLE_SETTINGS['modules']['value'])
        self.assertEqual(data['settings']['login_grace']['value'], DEFAULT_ROLE_SETTINGS['login_grace']['value'])

    def test_update_settings_custom_values(self):
        role = create_role()
        serializer = RoleCreateSerializer(role)
        orig_data = serializer.data
        role_data = copy.copy(orig_data)
        welcome_text = 'hey foo'

        role_data['settings'] = {'welcome_text': {'value': welcome_text}}
        response = self.client.put('/api/admin/roles/{}/'.format(role.id), role_data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['settings']['welcome_text']['value'], welcome_text)
        self.assertEqual(data['settings']['create_all']['value'], DEFAULT_ROLE_SETTINGS['create_all']['value'])
        self.assertEqual(data['settings']['modules']['value'], DEFAULT_ROLE_SETTINGS['modules']['value'])
        self.assertEqual(data['settings']['login_grace']['value'], DEFAULT_ROLE_SETTINGS['login_grace']['value'])
