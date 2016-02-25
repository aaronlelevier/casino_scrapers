from django.test import TestCase

from category.models import Category
from decision_tree.models import TreeField, TreeOption, TreeData, TreeLink
from decision_tree.tests import factory
from ticket.models import TicketStatus, TicketPriority


class FactoryTests(TestCase):

    def test_create_tree_link(self):
        tree_link = factory.create_tree_link()

        self.assertIsInstance(tree_link, TreeLink)
        self.assertIsInstance(tree_link.status, TicketStatus)
        self.assertIsInstance(tree_link.priority, TicketPriority)
        self.assertEqual(tree_link.categories.count(), 1)
        self.assertIsInstance(tree_link.categories.first(), Category)
        # TreeData relationships
        self.assertIsInstance(tree_link.destination, TreeData)
        self.assertIsInstance(tree_link.parent, TreeData)

    def test_create_tree_field(self):
        tree_field = factory.create_tree_field(3)

        self.assertIsInstance(tree_field, TreeField)
        self.assertEqual(tree_field.options.count(), 3)
        self.assertIsInstance(tree_field.options.first(), TreeOption)

    def test_create_tree_data(self):
        links = 2
        key = "foo"
        tree_data = factory.create_tree_data(links, key=key)

        self.assertIsInstance(tree_data, TreeData)
        self.assertEqual(tree_data.key, key)
        # Fields
        self.assertEqual(tree_data.fields.count(), 1)
        self.assertIsInstance(tree_data.fields.first(), TreeField)
        # Links
        # from_link
        self.assertIsInstance(tree_data.from_link, TreeLink)
        # links
        self.assertEqual(tree_data.links.count(), links)
        self.assertIsInstance(tree_data.links.first(), TreeLink)

    def test_create_multi_node_tree(self):
        factory.create_multi_node_tree()

        self.assertEqual(TreeData.objects.count(), 3)
        self.assertEqual(TreeLink.objects.count(), 11)

        tree_data_one = TreeData.objects.get(key="one")
        tree_data_two = TreeData.objects.get(key="two")
        tree_data_three = TreeData.objects.get(key="three")
        tree_link_one = TreeLink.objects.get(order=1)
        tree_link_two = TreeLink.objects.get(order=2)

        # one
        self.assertEqual(tree_data_one.links.count(), 6)
        self.assertIn(tree_link_one, tree_data_one.links.all())
        self.assertEqual(tree_link_one.destination, tree_data_two)
        # two
        self.assertEqual(tree_data_two.from_link, tree_link_one)
        self.assertEqual(tree_data_two.links.count(), 1)
        self.assertEqual(tree_data_two.links.first(), tree_link_two)
        self.assertEqual(tree_link_two.destination, tree_data_three)
        # three
        self.assertEqual(tree_data_three.from_link, tree_link_two)
