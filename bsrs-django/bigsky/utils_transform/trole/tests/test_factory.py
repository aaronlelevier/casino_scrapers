from django.test import TestCase

from utils_transform.trole.models import DominoRole
from utils_transform.trole.tests import factory


class FactoryTests(TestCase):

    def test_get_random_data(self):
        fields = [f.name for f in DominoRole._meta.get_fields()
                 if f.name != 'id']

        ret = factory.get_random_data(fields)

        for f in fields:
            self.assertIsInstance(ret[f], str)

    def test_create_role(self):
        dom_role = factory.create_domino_role()

        self.assertIsInstance(dom_role, DominoRole)
