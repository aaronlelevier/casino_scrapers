# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0003_auto_20151026_1417'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='password_history',
            field=django.contrib.postgres.fields.ArrayField(default=[], blank=True, base_field=models.CharField(max_length=254), size=2),
        ),
    ]
