# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0009_remove_person_password_history'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='password_history',
            field=django.contrib.postgres.fields.ArrayField(default=[], size=None, base_field=models.CharField(max_length=254), blank=True),
        ),
    ]
