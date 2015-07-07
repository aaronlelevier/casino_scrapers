from django.db import models
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible
class AbstractNameOrder(models.Model):
    order = models.IntegerField()
    name = models.CharField(max_length=100)
    
    class Meta:
        abstract = True
        ordering = ('order', 'name',)

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class AbstractName(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name