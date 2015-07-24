# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.auth.models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0005_auto_20150724_1434'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='person',
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
    ]
