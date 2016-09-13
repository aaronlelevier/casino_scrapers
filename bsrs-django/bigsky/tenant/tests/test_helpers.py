import json
import os
import requests

from django.test import TestCase

from tenant.helpers import request_token


class TestHelpers(TestCase):

    def test_request_token(self):
        ret = request_token()

        self.assertEqual(ret.status_code, 200)
        data = json.loads(ret.content.decode('utf8'))
        self.assertEqual(data['token_type'], 'bearer')
        self.assertEqual(data['expires_in'], 600)
        self.assertIn('access_token', data)
        self.assertIn('refresh_token', data)
        self.assertIn('scope', data)
