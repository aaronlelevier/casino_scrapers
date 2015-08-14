from rest_framework.test import APITestCase

from category.tests.factory import create_category_types
from person.tests.factory import PASSWORD, create_person


class CategoryTypeTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        pass