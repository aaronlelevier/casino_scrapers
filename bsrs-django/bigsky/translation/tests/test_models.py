from django.test import TestCase

from translation.models import Locale, Definition
from translation.tests import factory
from util.create import _generate_chars


class DefinitionTests(TestCase):

    def setUp(self):
        factory.create_definitions()
        self.definition = Definition.objects.first()

    def test_add(self):
        k = _generate_chars()
        v = _generate_chars()
        self.definition.values[k] = v
        self.definition.save()
        self.assertEqual(Definition.objects.get(id=self.definition.id).values[k], v)

    def test_update(self):
        k = self.definition.values.keys()[0]
        v = _generate_chars()
        self.definition.values[k] = v
        self.definition.save()
        self.assertEqual(Definition.objects.get(id=self.definition.id).values[k], v)

    def test_delete(self):
        k = self.definition.values.keys()[0]
        self.definition.values.pop(k, None)
        self.definition.save()
        with self.assertRaises(KeyError):
            Definition.objects.get(id=self.definition.id).values[k]