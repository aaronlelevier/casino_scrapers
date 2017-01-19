# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-17 19:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0004_auto_20170110_1733'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='sc_category_name',
            field=models.CharField(help_text='Mapping to SC Category name', max_length=100, null=True),
        ),
    ]