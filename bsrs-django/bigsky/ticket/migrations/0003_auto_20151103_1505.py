# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields.hstore


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0002_auto_20151103_1021'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticketactivity',
            name='comment',
        ),
        migrations.AddField(
            model_name='ticketactivity',
            name='content',
            field=django.contrib.postgres.fields.hstore.HStoreField(default={}, blank=True),
        ),
    ]
