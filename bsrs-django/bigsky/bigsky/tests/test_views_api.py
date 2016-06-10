import json

from rest_framework.test import APITestCase

from person.tests.factory import create_single_person, PASSWORD


class DashboardAPITests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_dashboard_get(self):
        response = self.client.get('/api/dashboard/')
        data = json.loads(response.content.decode('utf8'))
        # import pdb; pdb.set_trace()
        self.assertEqual(len(data), 1)
        self.assertEqual(data['settings'], {'dashboard_text': 'Welcome'})
