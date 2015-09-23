# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_auto_20150923_1422'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='locationlevel',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='locationstatus',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='locationtype',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='state',
            options={'ordering': ('id',)},
        ),
    ]
