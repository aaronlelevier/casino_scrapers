from django.core.management.base import BaseCommand

from category.models import Category
from utils_transform.tcategory.models import CategoryIssue
from utils_transform.tcategory.management.commands._etl_utils import (
    create_category_from_category_issue,)


class Command(BaseCommand):

    def handle(self, *args, **options):

        for x in CategoryIssue.objects.all():

            try:
                parent = Category.objects.filter(label='trade', name=x.trade_name).first()
            except Category.DoesNotExist:
                parent = None

            create_category_from_category_issue(x, parent=parent)
