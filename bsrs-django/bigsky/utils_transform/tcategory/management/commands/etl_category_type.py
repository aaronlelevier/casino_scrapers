from django.core.management.base import BaseCommand

from category.models import Category
from utils_transform.tlocation.models import CategoryType


class Command(BaseCommand):

    def handle(self, *args, **options):

        for x in CategoryType.objects.all():
            create_category_from_category_type(x)
