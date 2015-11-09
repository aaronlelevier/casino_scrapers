from django.test import TestCase

from model_mommy import mommy

from accounting.models import Currency
from contact.models import Email


class MyGenericForeignKeyTests(TestCase):

    def setUp(self):
        self.field = Email._meta.get_field('content_object')

    def test_verbose_name(self):
        self.assertEqual(self.field.verbose_name, "Content Object")

    def test_choices(self):
        self.assertEqual(self.field.choices, [])


class UpperCaseCharFieldTests(TestCase):

    def test_init_save_response(self):
        code = 'jpy'
        currency = mommy.make(Currency, name_plural="Yen", code=code)
        self.assertEqual(currency.code, code.upper())

    def test_retrieve_from_db(self):
        code = 'jpy'
        currency = mommy.make(Currency, name_plural="Yen", code=code)
        self.assertEqual(Currency.objects.get(id=currency.id).code, code.upper())
