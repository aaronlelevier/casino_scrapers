from django.core.management.base import BaseCommand

from category.models import Category
from utils_transform.tcategory.models import CategoryType
from utils_transform.tcategory.management.commands._etl_utils import (
    create_category_from_category_type,)


class Command(BaseCommand):

    def handle(self, *args, **options):

        for x in CategoryType.objects.all():
            create_category_from_category_type(x)
