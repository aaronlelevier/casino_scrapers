from django.core.management.base import BaseCommand

from category.models import Category
from utils_transform.tcategory.tests.factory import (create_category_type,
    create_category_trade, create_category_issue)


class Command(BaseCommand):

    def handle(self, *args, **options):
        domino_type = create_category_type()
        domino_trade = create_category_trade(domino_type)
        domino_issue = create_category_issue(domino_trade)
