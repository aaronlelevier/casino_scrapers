# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields.hstore


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0008_auto_20150825_1651'),
    ]

    operations = [
        migrations.AlterField(
            model_name='translation',
            name='context',
            field=django.contrib.postgres.fields.hstore.HStoreField(null=True, blank=True),
        ),
    ]
