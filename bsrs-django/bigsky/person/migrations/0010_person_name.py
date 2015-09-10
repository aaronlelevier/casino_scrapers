# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0009_remove_person_password_history'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='name',
            field=models.CharField(max_length=50, blank=True),
        ),
    ]
