from django.core.management.base import BaseCommand

from category.models import Category
from utils_transform.tcategory.models import CategoryTrade
from utils_transform.tcategory.management.commands._etl_utils import (
    create_category_from_category_trade,)


class Command(BaseCommand):

    def handle(self, *args, **options):

        for x in CategoryTrade.objects.all():

            try:
                parent = Category.objects.filter(label='type', name=x.type_name).first()
            except Category.DoesNotExist:
                parent = None

            create_category_from_category_trade(x, parent=parent)
