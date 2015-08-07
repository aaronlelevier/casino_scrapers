# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='person',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='proxyrole',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='role',
            options={'ordering': ('id',)},
        ),
    ]
