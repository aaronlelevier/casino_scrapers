# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0007_auto_20150903_1717'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='password_history',
            field=django.contrib.postgres.fields.ArrayField(default=[], size=None, base_field=models.CharField(help_text=b"List of old password hashes to make sure that the same password isn't used twice.", max_length=254), blank=True),
        ),
    ]
