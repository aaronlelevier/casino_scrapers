# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0007_auto_20150819_1734'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='name',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='location',
            name='number',
            field=models.CharField(unique=True, max_length=50),
        ),
    ]
