# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0002_auto_20150908_1343'),
        ('person', '0013_auto_20150923_1524'),
    ]

    operations = [
        migrations.AddField(
            model_name='role',
            name='category',
            field=models.ForeignKey(to='category.Category', null=True),
        ),
    ]
