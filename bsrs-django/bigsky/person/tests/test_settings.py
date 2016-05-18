from django.test import TestCase

from setting.settings import ROLE_SETTINGS


class RoleSettingsTests(TestCase):

    def setUp(self):
        self.settings = ROLE_SETTINGS

    def test_main(self):
        self.assertEqual(len(self.settings), 2)
        self.assertEqual(self.settings['create_all'], {
            'value': True,
            'type': 'bool',
            'inherited_from': 'role'
        })
        self.assertEqual(self.settings['auth_currency'], {
            "value": "009530c4-ce6c-4724-9cfd-37a16e787001",
            "type": "foreignkey",
            "inherited_from": "role",
            "related_model": ("accounting", "currency")
        })

    def test_foreignkey_types(self):
        for k,v in self.settings.items():
            if v['type'] == 'foreignkey':
                self.assertIn('related_model', v)
                self.assertEqual(len(v['related_model']), 2)
