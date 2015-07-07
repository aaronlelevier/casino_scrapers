"""
Created on Jan 26, 2015

@author: tkrier
"""
from __future__ import unicode_literals

from django.test import TestCase
from django.test.client import Client
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from model_mommy import mommy


USER_DICT = {
    'username': 'testuser',
    'password': 'torment',
    'first_name': 'Test',
    'last_name': 'User',
    'email': 'tuser@bigskytech.com'
    }


class SessionTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(**USER_DICT)

    def test_api_auth_login(self):
        response = self.client.post('/api/api-auth/login/', {'username': 'testuser', 'password': 'torment'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_incorrect_username(self):
        """
        providing incorrect username should cause error
        """
        response = self.client.post('/api/session/', {'username': 'incorrect_username', 'password': 'torment'}, format='json')
        
        expData = {'message': 'Error: user not valid', 'code': 400}
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, expData)
        
    def test_incorrect_password(self):
        """
        providing incorrect should cause error
        """
        response = self.client.post('/api/session/', {'username': 'testuser', 'password': 'badpassword'}, format='json')
        
        expData = {'message': 'Error: user not valid', 'code': 400}
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, expData)
        
    def test_blank_username(self):
        """
        providing blank username should cause error
        """
        response = self.client.post('/api/session/', {'username': '', 'password': 'badpassword'}, format='json')
        
        expData = {'message': 'Error: username or password is blank', 'code': 400}
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, expData)
        
    def test_blank_password(self):
        """
        providing blank password should cause error
        """
        response = self.client.post('/api/session/', {'username': 'testuser', 'password': ''}, format='json')
        
        expData = {'message': 'Error: username or password is blank', 'code': 400}
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, expData)
        
    def t_e_s_t_session_get(self):
        """
        login with test function and then check session
        """
        self.client.login(username=self.user.username, password=self.user.password)
        response = self.client.get('/api/session/', format='json')
        
        expData = {
            'id': self.user.id,
            'username': 'testuser',
            'status': 'valid',
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'tuser@bigskytech.com'
            }
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, expData)

    def test_session_delete(self):
        """
        login with test function and then logout and check session
        """
        self.client.login(username='testuser', password='torment')
        response = self.client.delete('/api/session/', format='json')
        
        expData = {'message': 'user logged out', 'code': 200}
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, expData)


class TokenTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(**USER_DICT)

        # for user in User.objects.all():
        #     Token.objects.get_or_create(user=user)

    def test_auth_token(self):
        self.assertIsInstance(self.user.auth_token, Token)
    
    def test_good_login(self):
        """
        providing credentials for session login should allow us to login
        """
        response = self.client.post('/api/token-auth/', {'username': 'testuser', 'password': 'torment'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
        self.assertEqual(response.data['email'], 'tuser@bigskytech.com')
         
    def test_incorrect_username(self):
        """
        providing incorrect username should cause error
        """
        response = self.client.post('/api/token-auth/', {'username': 'testuesr', 'password': 'torment'}, format='json')
         
        expData = "{\"non_field_errors\":[\"Unable to log in with provided credentials.\"]}"
         
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content, expData)
         
    def test_incorrect_password(self):
        """
        providing incorrect should cause error
        """
        response = self.client.post('/api/token-auth/', {'username': 'testuser', 'password': 'badpassword'}, format='json')
         
        expData = "{\"non_field_errors\":[\"Unable to log in with provided credentials.\"]}"
         
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content, expData)
         
    def test_blank_username(self):
        """
        providing blank username should cause error
        """
        response = self.client.post('/api/token-auth/', {'username': '', 'password': 'badpassword'}, format='json')
         
        expData = "{\"username\":[\"This field may not be blank.\"]}"
                 
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content, expData)
         
    def test_blank_password(self):
        """
        providing blank password should cause error
        """
        response = self.client.post('/api/token-auth/', {'username': 'testuser', 'password': ''}, format='json')
         
        expData = "{\"password\":[\"This field may not be blank.\"]}"
         
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content, expData)  

    def test_session_get(self):
        """
        login with test function and then check session
        """
        response = self.client.post('/api/token-auth/', {'username': 'testuser', 'password': 'torment'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
        self.assertEqual(response.data['email'], 'tuser@bigskytech.com')

    def test_session_delete(self):
        """
        login with test function and then logout and check session
        """
        response = self.client.post('/api/token-auth/', {'username': 'testuser', 'password': 'torment'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        if response.status_code == status.HTTP_200_OK:
            
            self.client.credentials(HTTP_AUTHORIZATION='Token ' + response.data['token'])
            response = self.client.delete('/api/token-auth/', format='json')
        
            expData = "{\"message\":\"user logged out\"}"
        
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.content, expData)

        else:
            self.fail('could not login with token authentication. status: {}'.format(response.status_code))
