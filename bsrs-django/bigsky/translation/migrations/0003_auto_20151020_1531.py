# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields.hstore


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0002_auto_20151020_1515'),
    ]

    operations = [
        migrations.AlterField(
            model_name='translation',
            name='context',
            field=django.contrib.postgres.fields.hstore.HStoreField(default={}, blank=True),
        ),
        migrations.AlterField(
            model_name='translation',
            name='values',
            field=django.contrib.postgres.fields.hstore.HStoreField(default={}, blank=True),
        ),
    ]
