# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('util', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='state',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='tester',
            options={'ordering': ('id',)},
        ),
    ]
