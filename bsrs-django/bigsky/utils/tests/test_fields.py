from django.test import TestCase

from model_mommy import mommy

from accounting.models import Currency
from category.tests.factory import create_single_category
from contact.models import Email
from person.tests.factory import create_single_person


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


class InheritedValueField(TestCase):

    def setUp(self):
        self.person = create_single_person()
        self.role = self.person.role
        self.tenant = self.role.tenant

    def test_instance_has_value(self):
        usd = Currency.objects.default()
        jpy = mommy.make(Currency, code='JPY')
        self.assertEqual(self.tenant.default_currency, usd)
        self.assertEqual(self.role.auth_currency, None)
        self.person.auth_currency = jpy
        self.person.save()

        ret = self.person.inherited()['auth_currency']

        self.assertEqual(ret['value'], str(jpy.id))
        self.assertEqual(ret['inherited_value'], str(usd.id))
        self.assertEqual(ret['inherits_from'], 'role')
        self.assertEqual(ret['inherits_from_id'], str(self.role.id))

    def test_instance_looks_up_two_levels_for_value(self):
        # the 'inherits_from' and 'inherits_from_id' howerver will only
        # show the level directly inherited from in order to drive UI.
        self.assertIsInstance(self.tenant.default_currency, Currency)
        self.assertIsNone(self.role.auth_currency)
        self.assertIsNone(self.person.auth_currency)

        ret = self.person.inherited()['auth_currency']

        self.assertEqual(ret['inherited_value'], str(self.tenant.default_currency.id))
        self.assertEqual(ret['inherits_from'], 'role')
        self.assertEqual(ret['inherits_from_id'], str(self.role.id))


class SelfInheritedValueFieldTests(TestCase):

    def setUp(self):
        self.cost_amount = 42
        self.type = create_single_category(cost_amount=self.cost_amount)
        self.trade = create_single_category(parent=self.type)
        self.issue = create_single_category(parent=self.trade)

    def test_concrete_field(self):
        cost_amount = 1
        self.trade.cost_amount = cost_amount

        ret = self.trade.proxy_cost_amount

        self.assertEqual(ret['value'], cost_amount)
        self.assertEqual(ret['inherited_value'], self.cost_amount)
        self.assertEqual(ret['inherits_from'], self.type.name)
        self.assertEqual(ret['inherits_from_id'], str(self.type.id))

    def test_inherited__parent(self):
        # inherited from model's parent
        self.assertIsNone(self.trade.cost_amount)

        ret = self.trade.proxy_cost_amount

        self.assertEqual(ret['value'], None)
        self.assertEqual(ret['inherited_value'], self.cost_amount)
        self.assertEqual(ret['inherits_from'], self.type.name)
        self.assertEqual(ret['inherits_from_id'], str(self.type.id))

    def test_inherited__grandparent(self):
        # inherited from the model's parent's parent
        self.assertIsNone(self.issue.cost_amount)

        ret = self.issue.proxy_cost_amount

        self.assertEqual(ret['value'], None)
        self.assertEqual(ret['inherited_value'], self.cost_amount)
        self.assertEqual(ret['inherits_from'], self.type.name)
        self.assertEqual(ret['inherits_from_id'], str(self.type.id))

    def test_inherited__parent_doesnt_inherit(self):
        # inherited from the model's parent's parent
        self.assertEqual(self.type.cost_amount, self.cost_amount)

        ret = self.type.proxy_cost_amount

        self.assertEqual(ret['value'], self.cost_amount)
        self.assertEqual(ret['inherited_value'], None)
        self.assertEqual(ret['inherits_from'], None)
        self.assertEqual(ret['inherits_from_id'], None)
