from django.test import TestCase

from utils_transform.tperson.models import DominoPerson
from utils_transform.tperson.tests import factory


class FactoryTests(TestCase):

    def test_get_random_data(self):
        fields = [f.name for f in DominoPerson._meta.get_fields()
                 if f.name != 'id']

        ret = factory.get_random_data(fields)

        for f in fields:
            self.assertIsInstance(ret[f], str)

    def test_create_person(self):
        dom_person = factory.create_domino_person()

        self.assertIsInstance(dom_person, DominoPerson)
