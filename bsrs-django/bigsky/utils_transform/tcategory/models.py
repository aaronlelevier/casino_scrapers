from django.db import models


class CategoryType(models.Model):
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    cost_code = models.TextField(blank=True, null=True)
    cost_amount = models.TextField(blank=True, null=True)


class CategoryTrade(models.Model):
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    cost_code = models.TextField(blank=True, null=True)
    cost_amount = models.TextField(blank=True, null=True)
    type_name = models.TextField()


class CategoryIssue(models.Model):
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    cost_code = models.TextField(blank=True, null=True)
    cost_amount = models.TextField(blank=True, null=True)
    trade_name = models.TextField()
