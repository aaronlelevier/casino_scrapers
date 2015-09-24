# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0002_auto_20150903_1516'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='address',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='addresstype',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='email',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='emailtype',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='phonenumber',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='phonenumbertype',
            options={'ordering': ('id',)},
        ),
    ]
