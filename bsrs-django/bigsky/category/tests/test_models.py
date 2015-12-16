from django.test import TestCase
from django.conf import settings

from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from category.tests import factory
from ticket.models import Ticket


class CategorySetupMixin(object):

    def setUp(self):
        factory.create_categories()
        self.type = Category.objects.filter(subcategory_label='trade').first()
        self.trade = Category.objects.filter(label='trade').first()
        self.child = Category.objects.filter(subcategory_label='sub_issue').first()


class CategoryTests(CategorySetupMixin, TestCase):

    def test_label_top_level(self):
        self.assertIsNone(self.type.parent)
        self.assertEqual(self.type.label, settings.TOP_LEVEL_CATEGORY_LABEL)

    def test_label_none_top_level(self):
        self.assertIsNotNone(self.trade.parent)
        self.assertEqual(self.trade.label, self.trade.parent.subcategory_label)

    def test_currency(self):
        self.assertIsInstance(self.trade.cost_currency, Currency)

    def test_to_dict(self):
        d = self.type.to_dict()
        self.assertIsInstance(d, dict)
        self.assertIn('id', d)
        self.assertIn('parent', d)
        self.assertEqual(d['parent'], None)

    def test_to_dict_with_parent(self):
        d = self.child.to_dict()
        self.assertIsInstance(d, dict)
        self.assertIn('id', d)
        self.assertIn('parent', d)
        self.assertEqual(d['parent']['id'], str(self.child.parent.pk))
        self.assertEqual(d['parent']['name'], self.child.parent.name)

    def test_to_simple_dict(self):
        d = self.type.to_simple_dict()

        self.assertEqual(d['id'], str(self.type.id))
        self.assertEqual(d['name'], self.type.name)
        self.assertIsNone(d['parent'])

    def test_to_simple_dict_with_parent(self):
        d = self.child.to_simple_dict()

        self.assertEqual(d['id'], str(self.child.id))
        self.assertEqual(d['name'], self.child.name)
        self.assertEqual(d['parent'], str(self.child.parent.id))


class CategoryLevelTests(CategorySetupMixin, TestCase):

    def test_set_level__no_parents(self):
        self.assertEqual(self.type._set_level(), 0)

    def test_set_level__one_parent(self):
        self.assertTrue(self.trade.parent)
        self.assertFalse(self.trade.parent.parent)
        self.assertEqual(self.trade._set_level(), 1)

    def test_set_level__one_parent(self):
        self.assertTrue(self.child.parent)
        self.assertTrue(self.child.parent.parent)
        self.assertFalse(self.child.parent.parent.parent)
        self.assertEqual(self.child._set_level(), 2)

    def test_level_type(self):
        self.assertEqual(self.type.level, 0)

    def test_level_trade(self):
        self.assertEqual(self.trade.level, 1)

    def test_level_trade(self):
        self.assertEqual(self.child.level, 2)


class TicketCategoryOrderingTests(TestCase):

    def setUp(self):
        """
        1. Loss Prevention - Locks - Drawer Lock
        2. Loss Prevention - Sensors - Front Door
        3. Repair - Electrical - Outlets
        4. Repair - Electrical - Switches
        5. Repair - Plumbing - Leak
        6. Repair - Plumbing - Toilet
        """
        # 1: Loss Prevention - Locks - Drawer Lock
        loss_prevention = Category.objects.create(name="Loss Prevention", subcategory_label="trade")
        locks = Category.objects.create(name="Locks", parent=loss_prevention, subcategory_label="issue")
        drawer_locks = Category.objects.create(name="Drawer Lock", parent=locks)

        # 2: Loss Prevention - Sensors - Front Door
        sensors = Category.objects.create(name="Sensors", parent=loss_prevention, subcategory_label='issue')
        front_door = Category.objects.create(name="Front Door", parent=sensors)

        # 3: Repair - Electrical - Outlets
        repair = Category.objects.create(name="Repair", subcategory_label="trade")
        electrical = Category.objects.create(name="Electrical", parent=repair, subcategory_label="issue")
        outlets = Category.objects.create(name="Outlets", parent=electrical)

        # 4: Repair - Electrical - Switches
        switches = Category.objects.create(name="Switches", parent=electrical)

        # 5: Repair - Plumbing - Leak
        plumbing = Category.objects.create(name="Plumbing", parent=repair, subcategory_label="issue")
        leak = Category.objects.create(name="Leak", parent=plumbing)

        # 6: Repair - Plumbing - Toilet
        toilet = Category.objects.create(name="Toilet", parent=plumbing)

        # Tickets
        self.one = mommy.make(Ticket, request="one")
        self.two = mommy.make(Ticket, request="two")
        self.three = mommy.make(Ticket, request="three")
        self.four = mommy.make(Ticket, request="four")
        self.five = mommy.make(Ticket, request="five")
        self.six = mommy.make(Ticket, request="six")

        # Join Categories to Tickets
        self.one.categories.add(loss_prevention)
        self.one.categories.add(locks)
        self.one.categories.add(drawer_locks)

        self.two.categories.add(loss_prevention)
        self.two.categories.add(sensors)
        self.two.categories.add(front_door)

        self.three.categories.add(repair)
        self.three.categories.add(electrical)
        self.three.categories.add(outlets)

        self.four.categories.add(repair)
        self.four.categories.add(electrical)
        self.four.categories.add(switches)

        self.five.categories.add(repair)
        self.five.categories.add(plumbing)
        self.five.categories.add(leak)

        self.six.categories.add(repair)
        self.six.categories.add(plumbing)
        self.six.categories.add(toilet)

    def test_ticket_one(self):
        ordered_categories = self.one.categories.order_by('level').values_list('name', flat=True)
        
        self.assertEqual(
            " - ".join(ordered_categories),
            "Loss Prevention - Locks - Drawer Lock"
        )

    def test_ticket_and_category_ordering(self):
        ret = (Ticket.objects.all()
                             .prefetch_related('categories')
                             .order_by('categories__level')
                             .values_list('categories__name', flat=True))

        self.assertEqual(
            ret,
            ['Loss Prevention - Locks - Drawer Lock',
            'Loss Prevention - Sensors - Front Door',
            'Repair - Electrical - Outlets',
            'Repair - Electrical - Switches',
            'Repair - Plumbing - Leak',
            'Repair - Plumbing - Toilet']
        )

