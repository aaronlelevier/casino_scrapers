# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0005_auto_20150819_1311'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='number',
            field=models.CharField(max_length=100),
        ),
    ]
