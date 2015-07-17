# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0002_auto_20150717_1044'),
    ]

    operations = [
        migrations.RenameField(
            model_name='address',
            old_name='address1',
            new_name='address',
        ),
        migrations.RenameField(
            model_name='address',
            old_name='postalcode',
            new_name='postal_code',
        ),
        migrations.RemoveField(
            model_name='address',
            name='address2',
        ),
        migrations.RemoveField(
            model_name='address',
            name='address3',
        ),
    ]
