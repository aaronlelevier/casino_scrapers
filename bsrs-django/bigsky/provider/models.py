from django.db import models
from django.core.validators import URLValidator
from utils.models import BaseModel
from category.models import Category


class Provider(BaseModel):
    fbid = models.CharField(max_length=64, help_text="foreign key from FixxBook API preferred provider resource, depends on location and subscriber data")
    name = models.CharField(max_length=256, help_text="name of perferred provider from FixxBook API")
    address1 = models.CharField(max_length=128, null=True)
    address2 = models.CharField(max_length=128, null=True)
    country_code = models.CharField(max_length=8, null=True)
    postal_code = models.CharField(max_length=32, null=True)
    region_name = models.CharField(max_length=128, null=True)
    city = models.CharField(max_length=128, null=True)
    fax = models.CharField(max_length=128, null=True)
    phone = models.CharField(max_length=64, null=True)
    email = models.EmailField(null=True)
    logo = models.TextField(validators=[URLValidator()], null=True)

    categories = models.ManyToManyField(Category, related_name='providers')

