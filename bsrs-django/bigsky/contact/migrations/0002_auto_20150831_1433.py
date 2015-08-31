# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='phonenumber',
            name='person',
            field=models.ForeignKey(related_name='phone_numbers', blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.AddField(
            model_name='phonenumber',
            name='type',
            field=models.ForeignKey(to='contact.PhoneNumberType'),
        ),
        migrations.AddField(
            model_name='email',
            name='location',
            field=models.ForeignKey(related_name='emails', blank=True, to='location.Location', null=True),
        ),
        migrations.AddField(
            model_name='email',
            name='person',
            field=models.ForeignKey(related_name='emails', blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.AddField(
            model_name='email',
            name='type',
            field=models.ForeignKey(to='contact.EmailType'),
        ),
        migrations.AddField(
            model_name='address',
            name='location',
            field=models.ForeignKey(related_name='addresses', blank=True, to='location.Location', null=True),
        ),
        migrations.AddField(
            model_name='address',
            name='person',
            field=models.ForeignKey(related_name='addresses', blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.AddField(
            model_name='address',
            name='type',
            field=models.ForeignKey(to='contact.AddressType'),
        ),
    ]
