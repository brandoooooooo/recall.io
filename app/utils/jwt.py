from functools import lru_cache
import json
import os
import time
from typing import List
from jose import jwk, jwt
from jose.utils import base64url_decode
import requests
from dotenv import load_dotenv

load_dotenv()


PUBLIC_KEYS_URL_TEMPLATE = "https://{}/.well-known/jwks.json"
AUTH0_DOMAIN = os.environ.get("AUTH0_DOMAIN", None)


def check_expired(exp: int, testmode: bool = False) -> None:
    if time.time() > exp and not testmode:
        raise Exception("Token is expired")


@lru_cache(maxsize=1)
def get_keys(keys_url: str) -> List[dict[str, str]]:
    # returns list of dicts with keys (kty, use, n, e, kid, x5t, x5c, alg)
    if keys_url.startswith("http"):
        r = requests.get(keys_url)
        keys_response = r.json()
    else:
        with open(keys_url) as f:
            keys_response = json.loads(f.read())
    return keys_response.get("keys")


def get_public_key(token: str):
    if AUTH0_DOMAIN is None:
        raise Exception("invalid auth0 domain")

    url = PUBLIC_KEYS_URL_TEMPLATE.format(AUTH0_DOMAIN)
    # TODO: investigate but shouldn't be making a network call per
    keys = get_keys(url)

    # extract kid from token header (bc we're using RS256)
    headers = jwt.get_unverified_header(token)
    kid = headers["kid"]

    key = next(filter(lambda k: k["kid"] == kid, keys))
    if not key:
        raise Exception("Public key not found in jwks.json")

    return jwk.construct(key)


def decode(token: str) -> dict[str, str]:
    # split one from right to pop sig (3 part jwt)
    message, encoded_signature = token.rsplit(".", 1)
    decoded_signature = base64url_decode(encoded_signature.encode("utf-8"))
    pk = get_public_key(token)

    if not pk.verify(message.encode("utf-8"), decoded_signature):
        raise Exception("Signature verification failed")

    # technically could do this manually but if you look at jose.jws._load it's a nice abstraction
    claims = jwt.get_unverified_claims(token)
    # check if token claim is expired
    # TODO: disable testmode in prod
    check_expired(claims["exp"], testmode=True)

    return claims


__all__ = ["decode"]
