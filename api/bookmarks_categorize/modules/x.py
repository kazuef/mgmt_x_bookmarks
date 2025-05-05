import base64
import hashlib
import os
import re
import json
import requests
from requests.auth import AuthBase, HTTPBasicAuth
from requests_oauthlib import OAuth2Session


class XModule:
    """XModule class for handling X API requests."""

    def __init__(
            self,
            client_id: str,
            client_secret: str,
            redirect_uri: str,
            scopes: list[str]
        ) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.scopes = scopes
        # self.client_id = os.environ.get("CLIENT_ID")
        # self.client_secret = os.environ.get("CLIENT_SECRET")
        # self.redirect_uri = "http://localhost:8081/"
        # self.scopes = ["bookmark.read", "tweet.read", "users.read", "offline.access"]

    def authenticate(self):
        """Authenticate with the X API using OAuth 2.0."""
        # Set up the OAuth2 session
        oauth = OAuth2Session(
            client_id=self.client_id,
            redirect_uri=self.redirect_uri,
            scope=self.scopes,
        )
        return oauth
    
    def get_authorization_url(self, oauth):
        """Get the authorization URL for the user to authorize the app."""
        auth_url = "https://twitter.com/i/oauth2/authorize"
        code_verifier = base64.urlsafe_b64encode(os.urandom(30)).decode("utf-8")
        code_verifier = re.sub("[^a-zA-Z0-9]+", "", code_verifier)
        code_challenge = hashlib.sha256(code_verifier.encode("utf-8")).digest()
        code_challenge = base64.urlsafe_b64encode(code_challenge).decode("utf-8")
        code_challenge = code_challenge.replace("=", "")
        
        authorization_url, state = oauth.authorization_url(
            auth_url, code_challenge=code_challenge, code_challenge_method="S256"
        )
        return authorization_url
    
    def fetch_access_token(self, oauth, authorization_response):
        """Fetch the access token using the authorization response."""
        token_url = "https://api.twitter.com/2/oauth2/token"
        auth = False
        if self.client_secret:
            auth = HTTPBasicAuth(self.client_id, self.client_secret)
        
        token = oauth.fetch_token(
            token_url=token_url,
            authorization_response=authorization_response,
            auth=auth,
            client_id=self.client_id,
            include_client_id=True,
        )
        return token["access_token"]
    
    def get_user_id(self, access_token):
        """Get the user ID using the access token."""
        user_me = requests.request(
            "GET",
            "https://api.twitter.com/2/users/me",
            headers={"Authorization": f"Bearer {access_token}"},
        ).json()
        user_id = user_me["data"]["id"]
        return user_id
    
    def get_bookmarks(self, user_id, access_token):
        """Get the bookmarks for the user."""
        url = f"https://api.twitter.com/2/users/{user_id}/bookmarks"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "BookmarksSampleCode",
        }
        response = requests.request("GET", url, headers=headers)
        if response.status_code != 200:
            raise Exception(
                f"Request returned an error: {response.status_code} {response.text}"
            )
        print(f"Response code: {response.status_code}")
        json_response = response.json()
        print(json.dumps(json_response, indent=4, sort_keys=True))
        return json.dumps(json_response, indent=4, sort_keys=True)
