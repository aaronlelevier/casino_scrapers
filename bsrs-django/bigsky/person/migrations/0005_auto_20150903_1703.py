# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0004_auto_20150903_1528'),
    ]

    operations = [
        migrations.AddField(
            model_name='role',
            name='password_digit_required',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='password_expire_date',
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='password_expired_login_count',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='password_lower_char_required',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='password_special_char_required',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='password_upper_char_required',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_expire',
            field=models.IntegerField(help_text=b"Number of days after setting password that it will expire.If '0', password will never expire.", null=True, blank=True),
        ),
    ]
