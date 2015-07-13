from django.test import TestCase
from django.contrib.contenttypes.models import ContentType

from model_mommy import mommy

from person.models import Person
from person.tests.factory import create_person
from util.models import MainSetting, CustomSetting, Tester


class TesterTests(TestCase):
    # Empty Model to test Base Model Methods

    def setUp(self):
        # default ``objects`` model manager should only
        # return non-deleted objects
        self.t_del = mommy.make(Tester, deleted=True)
        self.t_ok = mommy.make(Tester)

    def test_managers(self):
        self.assertEqual(len(Tester.objects.all()), 1)

    def test_managers_all(self):
        self.assertEqual(len(Tester.objects_all.all()), 2)

    def test_delete(self):
        # can't hide already ``deleted=True`` object, so should have
        # the same object count
        self.t_del.delete()
        self.assertEqual(len(Tester.objects_all.all()), 2)

    def test_delete_real(self):
        self.t_del.delete(override=True)
        self.assertEqual(len(Tester.objects_all.all()), 1)


class MainSettingTests(TestCase):
    # Only testing one ``Setting` Model b/c they are inheriting
    # from the same Base Model

    def setUp(self):
        self.person = create_person()

    def test_setting(self):
        ct = ContentType.objects.get(app_label='person', model='person')
        s = MainSetting.objects.create(
            content_type=ct,
            object_id=self.person.id,
            content_object=self.person
            )
        self.assertEqual(s.content_object, self.person)