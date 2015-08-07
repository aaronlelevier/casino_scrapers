# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='authamount',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='currency',
            options={'ordering': ('id',)},
        ),
    ]
