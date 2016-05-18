import json
import uuid

from rest_framework.test import APITestCase

from person.tests.factory import PASSWORD, create_single_person
from setting.serializers import SettingSerializer
from setting.settings import GENERAL_SETTINGS
from setting.tests.factory import create_general_setting


class SettingTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        self.general_setting = create_general_setting()

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/settings/')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(self.general_setting.id))
        self.assertEqual(data['results'][0]['name'], self.general_setting.name)
        self.assertNotIn('settings', data['results'][0])

    def test_detail(self):
        response = self.client.get('/api/admin/settings/{}/'.format(self.general_setting.id))
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], str(self.general_setting.id))
        self.assertEqual(data['name'], self.general_setting.name)
        # settings
        for key in GENERAL_SETTINGS.keys():
            for field in ['value', 'type']:
                self.assertEqual(data['settings'][key][field], GENERAL_SETTINGS[key][field])

    def test_create(self):
        raw_data = {
            'id': str(uuid.uuid4()),
            'name': 'foo'
        }

        response = self.client.post('/api/admin/settings/', raw_data, format='json')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 201)
        self.assertEqual(raw_data['id'], data['id'])
        self.assertEqual(raw_data['name'], data['name'])
        self.assertIn('settings', data)

    def test_update(self):
        new_dashboard_text = "Bueno"
        new_test_mode = False
        serializer = SettingSerializer(self.general_setting)
        raw_data = serializer.data
        self.assertEqual(raw_data['settings']['dashboard_text'], {'value': 'Welcome', 'type': 'str'})
        raw_data['settings'] = {
            'dashboard_text': new_dashboard_text,
        }

        response = self.client.put('/api/admin/settings/{}/'.format(self.general_setting.id), raw_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        # import pdb; pdb.set_trace()
        self.assertEqual(data['settings']['dashboard_text']['value'], new_dashboard_text)
        self.assertEqual(data['settings']['dashboard_text']['type'], 'str')
