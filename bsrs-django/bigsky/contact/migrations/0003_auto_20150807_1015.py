# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0002_auto_20150804_1715'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='address',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='addresstype',
            options={},
        ),
        migrations.AlterModelOptions(
            name='email',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='emailtype',
            options={},
        ),
        migrations.AlterModelOptions(
            name='phonenumber',
            options={'ordering': ('id',)},
        ),
        migrations.AlterModelOptions(
            name='phonenumbertype',
            options={},
        ),
    ]
