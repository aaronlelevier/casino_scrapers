# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0004_auto_20150818_1436'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='number',
            field=models.CharField(unique=True, max_length=100),
        ),
    ]
