# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0002_auto_20151211_1302'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='address',
            options={'ordering': ('address1',)},
        ),
        migrations.RenameField(
            model_name='address',
            old_name='address',
            new_name='address1',
        ),
        migrations.RenameField(
            model_name='address',
            old_name='postal_code',
            new_name='zip',
        ),
        migrations.AddField(
            model_name='address',
            name='address2',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
