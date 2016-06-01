import json
import uuid

from rest_framework.test import APITestCase

from dtd.models import TreeData
from dtd.tests.factory import create_dtd_fixture_data
from person.tests.factory import PASSWORD, create_single_person
from setting.models import Setting
from setting.serializers import SettingSerializer
from setting.settings import GENERAL_SETTINGS


class SettingTests(APITestCase):

    def setUp(self):
        create_dtd_fixture_data()
        self.start_dtd = TreeData.objects.get(key='Start')
        self.person = create_single_person()
        self.setting = Setting.objects.get(name='general')
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/settings/?name=general')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(self.setting.id))
        self.assertEqual(data['results'][0]['name'], self.setting.name)
        self.assertNotIn('settings', data['results'][0])

    def test_detail(self):
        response = self.client.get('/api/admin/settings/{}/'.format(self.setting.id))
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], str(self.setting.id))
        self.assertEqual(data['name'], self.setting.name)
        self.assertEqual(data['title'], self.setting.title)
        # settings
        for key in GENERAL_SETTINGS.keys():
            self.assertEqual(
                data['settings'][key]['value'],
                GENERAL_SETTINGS[key]['value']
            )
            self.assertNotIn('type', data['settings'][key])

        # dt_start_id is used to get 'key' as well on detail request
        self.assertEqual(data['settings']['dt_start']['value']['id'], str(self.start_dtd.id))
        self.assertEqual(data['settings']['dt_start']['value']['key'], self.start_dtd.key)

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
        serializer = SettingSerializer(self.setting)
        raw_data = serializer.data
        self.assertEqual(raw_data['settings']['dashboard_text'], {'value': 'Welcome'})
        raw_data['settings'] = {
            'dashboard_text': new_dashboard_text,
        }

        response = self.client.put('/api/admin/settings/{}/'.format(self.setting.id), raw_data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['settings']['dashboard_text']['value'], new_dashboard_text)
        self.assertNotIn('type', data['settings']['dashboard_text'])

        # next GET request, desired structure is maintained
        response = self.client.get('/api/admin/settings/{}/'.format(self.setting.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['settings']['dashboard_text']['value'], new_dashboard_text)
