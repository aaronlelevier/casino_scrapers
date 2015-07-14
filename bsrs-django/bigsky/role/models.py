from django.db import models

from person.models import Role
from util.models import BaseModel, AbstractName


class Category(AbstractName):
    '''
    TODO: not sure if this model is needed or what it's purpose is?
    '''
    role = models.ForeignKey(Role)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'