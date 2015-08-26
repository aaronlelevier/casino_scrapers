# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields.hstore


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0009_auto_20150825_1653'),
    ]

    operations = [
        migrations.AlterField(
            model_name='translation',
            name='context',
            field=django.contrib.postgres.fields.hstore.HStoreField(default={'foo': 'bar'}),
            preserve_default=False,
        ),
    ]
