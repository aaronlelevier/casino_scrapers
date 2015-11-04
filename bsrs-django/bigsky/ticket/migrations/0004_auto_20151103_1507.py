# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields.hstore


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0003_auto_20151103_1505'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticketactivity',
            name='content',
            field=django.contrib.postgres.fields.hstore.HStoreField(null=True, blank=True),
        ),
    ]
