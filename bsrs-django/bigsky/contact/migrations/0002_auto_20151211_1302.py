# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='address',
            name='type',
            field=models.ForeignKey(to='contact.AddressType', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='email',
            name='type',
            field=models.ForeignKey(to='contact.EmailType', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='phonenumber',
            name='type',
            field=models.ForeignKey(to='contact.PhoneNumberType', null=True, blank=True),
        ),
    ]
