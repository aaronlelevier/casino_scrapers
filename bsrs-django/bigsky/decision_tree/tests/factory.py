from model_mommy import mommy

from category.tests.factory import create_single_category
from decision_tree.models import TreeField, TreeOption, TreeData, TreeLink
from ticket.tests.factory import create_ticket_status, create_ticket_priority


def create_tree_link():
    destination = mommy.make(TreeData)
    child_data_one = mommy.make(TreeData)
    category = create_single_category()
    status = create_ticket_status()
    priority = create_ticket_priority()

    tree_link =  mommy.make(TreeLink, status=status, priority=priority,
                            destination=destination)
    tree_link.categories.add(category)
    tree_link.child_data.add(child_data_one)

    return tree_link


def create_tree_field(options=2):
    tree_field = mommy.make(TreeField)

    for i in range(options):
        mommy.make(TreeOption, field=tree_field)

    return tree_field


def create_tree_data():
    parent_link = mommy.make(TreeLink)
    link = mommy.make(TreeLink)
    field = create_tree_field()

    tree_data = mommy.make(TreeData)

    tree_data.fields.add(field)
    tree_data.links.add(link)

    tree_data.parent_link = parent_link
    tree_data.save()

    return tree_data
