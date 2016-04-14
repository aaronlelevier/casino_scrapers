import json
import uuid

from rest_framework.test import APITestCase

from setting.serializers import SettingSerializer
from setting.settings import DEFAULT_GENERAL_SETTINGS
from setting.tests.mixins import SettingSetupMixin


class SettingTests(SettingSetupMixin, APITestCase):

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
        for key in DEFAULT_GENERAL_SETTINGS.keys():
            for field in ['value', 'inherited_from']:
                self.assertEqual(data['settings'][key][field], DEFAULT_GENERAL_SETTINGS[key][field])

    def test_create__does_not_have_settings(self):
        raw_data = {
            'id': str(uuid.uuid4()),
            'name': 'foo'
        }

        response = self.client.post('/api/admin/settings/', raw_data, format='json')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 201)
        self.assertEqual(raw_data['id'], data['id'])
        self.assertEqual(raw_data['name'], data['name'])
        self.assertNotIn('settings', data)

    def test_update(self):
        new_welcome_text = "Bueno"
        serializer = SettingSerializer(self.general_setting)
        raw_data = serializer.data
        raw_data['settings'] = {'welcome_text': new_welcome_text}

        response = self.client.put('/api/admin/settings/{}/'.format(self.general_setting.id), raw_data, format='json')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        # welcome_text
        self.assertEqual(data['settings']['welcome_text']['value'], new_welcome_text)
        self.assertEqual(data['settings']['welcome_text']['inherited_from'], 'general')


