from django.test import TestCase

from model_mommy import mommy

from person.models import Person
from person.tests.factory import create_person
from util.models import Setting


class SettingTests(TestCase):

    def setUp(self):
        self.person = create_person()

    def test_setting(self):
        s = mommy.make(Setting, object_id=self.person.id)
        self.assertEqual(s.content_object, self.person)