from model_mommy import mommy

from category.tests.factory import create_single_category
from decision_tree.models import TreeField, TreeOption, TreeData, TreeLink
from ticket.tests.factory import create_ticket_status, create_ticket_priority


def create_tree_link():
    destination = mommy.make(TreeData)
    parent = mommy.make(TreeData)
    category = create_single_category()
    status = create_ticket_status()
    priority = create_ticket_priority()

    tree_link =  mommy.make(TreeLink, status=status, priority=priority,
                            destination=destination, parent=parent)
    tree_link.categories.add(category)

    return tree_link


def create_tree_field(options=2):
    tree_field = mommy.make(TreeField)

    for i in range(options):
        mommy.make(TreeOption, field=tree_field)

    return tree_field


def create_tree_data(links=1, **kwargs):
    tree_data = mommy.make(TreeData, **kwargs)
    # Fields
    field = create_tree_field()
    tree_data.fields.add(field)
    # Links
    tree_data.from_link = mommy.make(TreeLink)
    tree_data.save()

    for i in range(links):
        link = mommy.make(TreeLink)
        tree_data.links.add(link)

    return tree_data


def create_multi_node_tree():
    one = create_tree_data(links=6, key="one")
    two = create_tree_data(key="two")
    three = create_tree_data(key="three")

    link_one = one.links.first()
    link_one.order = 1
    link_one.destination = two
    link_one.save()

    link_two = two.links.first()
    link_two.order = 2
    link_two.destination = three
    link_two.save()
