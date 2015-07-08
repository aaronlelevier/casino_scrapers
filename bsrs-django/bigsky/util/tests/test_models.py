from django.test import TestCase
from django.contrib.contenttypes.models import ContentType

from model_mommy import mommy

from person.models import Person
from person.tests.factory import create_person
from util.models import Setting


class SettingTests(TestCase):

    def setUp(self):
        self.person = create_person()

    def test_setting(self):
        ct = ContentType.objects.get(app_label='person', model='person')
        s = Setting.objects.create(
            content_type=ct,
            object_id=self.person.id,
            content_object=self.person
            )
        self.assertEqual(s.content_object, self.person)