# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0006_auto_20150814_1047'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='categorytype',
            name='parent',
        ),
        migrations.RemoveField(
            model_name='category',
            name='type',
        ),
        migrations.AddField(
            model_name='category',
            name='label',
            field=models.CharField(max_length=100, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='category',
            name='subcategory_label',
            field=models.CharField(max_length=100, null=True, blank=True),
        ),
        migrations.DeleteModel(
            name='CategoryType',
        ),
    ]
