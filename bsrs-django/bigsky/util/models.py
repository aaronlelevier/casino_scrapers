from django.db import models


class AbstractNameOrder(models.Model):
    order = models.IntegerField()
    name = models.CharField(max_length=100)
    
    class Meta:
        abstract = True
        ordering = ('order', 'name',)


class AbstractName(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        abstract = True

    def __unicode__(self):
        return self.name