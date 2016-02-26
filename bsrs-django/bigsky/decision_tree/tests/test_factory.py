from django.test import TestCase

from model_mommy import mommy

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
        self.assertIsNone(tree_link.destination)
        self.assertEqual(tree_link.parents.count(), 1)
        self.assertIsInstance(tree_link.parents.first(), TreeData)

    def test_create_tree_link__with_destination(self):
        destination = mommy.make(TreeData)

        tree_link = factory.create_tree_link(destination)

        self.assertIsInstance(tree_link, TreeLink)
        self.assertEqual(tree_link.destination, destination)

    def test_create_tree_field(self):
        tree_field = factory.create_tree_field(3)

        self.assertIsInstance(tree_field, TreeField)
        self.assertEqual(tree_field.options.count(), 3)
        self.assertIsInstance(tree_field.options.first(), TreeOption)

    def test_create_tree_data_key(self):
        key = "foo"
        tree_data = factory.create_tree_data(key=key)

        self.assertIsInstance(tree_data, TreeData)
        self.assertEqual(tree_data.key, key)
        # Fields
        self.assertEqual(tree_data.fields.count(), 1)
        self.assertIsInstance(tree_data.fields.first(), TreeField)
        # Links
        self.assertEqual(tree_data.links.count(), 1)
        self.assertIsInstance(tree_data.links.first(), TreeLink)

    def test_create_tree_data__links(self):
        links = 2
        key = 'foo'

        tree_data = factory.create_tree_data(links, key=key)

        self.assertEqual(tree_data.links.count(), links)
        self.assertEqual(tree_data.key, key)
        self.assertIsInstance(tree_data.links.first(), TreeLink)

    def test_create_tree_data__links_and_destination(self):
        destination = mommy.make(TreeData)

        tree_data = factory.create_tree_data(destination=destination)

        self.assertEqual(tree_data.links.count(), 1)
        self.assertEqual(tree_data.links.first().destination, destination)

    def test_create_multi_node_tree(self):
        factory.create_multi_node_tree()

        one = TreeData.objects.get(key="one")
        two = TreeData.objects.get(key="two")
        three = TreeData.objects.get(key="three")

        # one
        self.assertEqual(one.links.count(), 1)
        self.assertEqual(one.links.first().destination, two)
        # two
        self.assertEqual(two.links.count(), 1)
        self.assertEqual(two.links.first().destination, three)
        # three
        self.assertEqual(three.links.count(), 1)
        self.assertIsNone(three.links.first().destination)
