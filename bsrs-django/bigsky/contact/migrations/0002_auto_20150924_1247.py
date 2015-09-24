# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contact', '0001_initial'),
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='phonenumber',
            name='person',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, null=True, related_name='phone_numbers'),
        ),
        migrations.AddField(
            model_name='phonenumber',
            name='type',
            field=models.ForeignKey(to='contact.PhoneNumberType'),
        ),
        migrations.AddField(
            model_name='email',
            name='location',
            field=models.ForeignKey(to='location.Location', blank=True, null=True, related_name='emails'),
        ),
        migrations.AddField(
            model_name='email',
            name='person',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, null=True, related_name='emails'),
        ),
        migrations.AddField(
            model_name='email',
            name='type',
            field=models.ForeignKey(to='contact.EmailType'),
        ),
        migrations.AddField(
            model_name='address',
            name='location',
            field=models.ForeignKey(to='location.Location', blank=True, null=True, related_name='addresses'),
        ),
        migrations.AddField(
            model_name='address',
            name='person',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, null=True, related_name='addresses'),
        ),
        migrations.AddField(
            model_name='address',
            name='type',
            field=models.ForeignKey(to='contact.AddressType'),
        ),
    ]
