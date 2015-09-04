# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150903_1520'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='password_history_length',
            field=django.contrib.postgres.fields.ArrayField(default=[], size=None, base_field=models.PositiveIntegerField(help_text=b'Will be NULL if password length has never been changed.'), blank=True),
            preserve_default=False,
        ),
    ]
