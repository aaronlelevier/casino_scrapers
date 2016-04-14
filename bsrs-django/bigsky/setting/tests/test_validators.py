import json

from rest_framework.test import APITestCase

from setting.serializers import SettingSerializer
from setting.tests.mixins import SettingSetupMixin


class SettingsSchemaValidatorTests(SettingSetupMixin, APITestCase):

    def test_required(self):
        serializer = SettingSerializer(self.general_setting)
        raw_data = serializer.data
        field = 'welcome_text'
        raw_data['settings'].pop('welcome_text', None)

        response = self.client.put('/api/admin/settings/{}/'.format(self.general_setting.id), raw_data, format='json')

        self.assertEqual(response.status_code, 400)
        message = json.loads(response.content.decode('utf8'))
        self.assertEqual(message['non_field_errors'], ["Invalid JSON - '{}' is a required property".format(field)])

    def test_type(self):
        serializer = SettingSerializer(self.general_setting)
        raw_data = serializer.data
        raw_data['settings'] = {'welcome_text': 1}

        response = self.client.put('/api/admin/settings/{}/'.format(self.general_setting.id), raw_data, format='json')

        self.assertEqual(response.status_code, 400)
        message = json.loads(response.content.decode('utf8'))
        self.assertEqual(message['non_field_errors'], ["Invalid JSON - 1 is not of type 'string'"])

    def test_minLength(self):
        serializer = SettingSerializer(self.general_setting)
        raw_data = serializer.data
        raw_data['settings'] = {'welcome_text': 'a'}

        response = self.client.put('/api/admin/settings/{}/'.format(self.general_setting.id), raw_data, format='json')

        self.assertEqual(response.status_code, 400)
        message = json.loads(response.content.decode('utf8'))
        self.assertEqual(message['non_field_errors'], ["Invalid JSON - 'a' is too short"])

    def test_maxLength(self):
        serializer = SettingSerializer(self.general_setting)
        raw_data = serializer.data
        raw_data['settings'] = {'welcome_text': 'hahahahahahahahahaha'}

        response = self.client.put('/api/admin/settings/{}/'.format(self.general_setting.id), raw_data, format='json')

        self.assertEqual(response.status_code, 400)
        message = json.loads(response.content.decode('utf8'))
        self.assertEqual(message['non_field_errors'], ["Invalid JSON - 'hahahahahahahahahaha' is too long"])
