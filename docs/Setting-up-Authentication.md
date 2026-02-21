# Setting Up Authentication

> 💬 We offer [consulting services](https://docs.monadical.com/s/archivebox-consulting-services) to set up, integrate, and maintain ArchiveBox with your org's auth & hosting.

ArchiveBox supports several types of authentication for users logging in via the Admin Web UI or REST API.

## Set Up Admin Web UI Permissions

Use these three options to set up your desired permissions for non-admin guest users:

- [`PUBLIC_INDEX=True`](Configuration.md#public_index--public_snapshots--public_add_view): Default _allows_ non-logged-in users to see Snapshot list
- [`PUBLIC_SNAPSHOTS=True`](Configuration.md#public_index--public_snapshots--public_add_view): Default _allows_ non-logged-in users to see Snapshot content
- [`PUBLIC_ADD_VIEW=False`](Configuration.md#public_index--public_snapshots--public_add_view): Default _doesn't allow_ non-logged-in users to submit new URLs

> **Note:** Open source ArchiveBox does not support setting up _non-admin_ users & groups with custom permissions.

---

## Admin Web UI Authentication Methods

### Username & Password (the default)

You need a user account to access the Admin UI, you can run the commands below to create/edit a user from the CLI:

```bash
archivebox manage createsuperuser
archivebox manage changepassword <username>

# equivalent: docker compose run archivebox manage [...]
# equivalent: docker run -v $PWD:/data archivebox/archivebox manage [...]
```

Existing users can be managed from the Admin UI here: [`/admin/auth/user/`](http://127.0.0.1:8000/admin/auth/user/)  
and you can change your password in the UI here: [`/admin/password_change/`](http://127.0.0.1:8000/admin/password_change/).

### Reverse Proxy Authentication

> Can be used with a reverse proxy auth provider like [oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy), [Cloudflare Zero Trust](https://developers.cloudflare.com/cloudflare-one/tutorials/access-workers/#create-a-worker-with-custom-headers), [Authentik](https://docs.goauthentik.io/docs/providers/proxy/), and others.

Set these ArchiveBox configuration values based on your reverse proxy setup and needs:

```bash
# REQUIRED: the header where your upstream reverse proxy will place the authenticated user's username/email
# EXAMPLE: Cf-Access-Authenticated-User-Email (if using Cloudflare Access / Zero Trust)
REVERSE_PROXY_USER_HEADER=X-Remote-User

# REQUIRED: the IP/CIDR of your upstream reverse proxy server
# WARNING: make sure this range contains ONLY your reverse proxy server!
# ArchiveBox will completely trust any IP in this range for authentication
REVERSE_PROXY_WHITELIST=192.0.2.3/32

# OPTIONAL: redirect users to an external URL after they log out
LOGOUT_REDIRECT_URL=https://auth.yourcompany.example.com/after/logout
```

More info:

- [Configuration: REVERSE_PROXY_USER_HEADER](Configuration.md#reverse_proxy_user_header)
- [Configuration: REVERSE_PROXY_WHITELIST](Configuration.md#reverse_proxy_whitelist)
- https://github.com/ArchiveBox/ArchiveBox/pull/866

### LDAP Authentication

> Can be used with an SSO provider like [Authentik](https://github.com/goauthentik/authentik), [Authelia](https://github.com/authelia/authelia), [Okta / Auth0](https://www.okta.com/), [Keycloak](https://www.keycloak.org/), and others.

First, `pip`-install the `ldap` add-on to use this feature:

```bash
pip install archivebox[ldap]
```

Then set these configuration values to finish configuring LDAP:

```
LDAP=True
LDAP_SERVER_URI="ldap://ldap.example.com:3389"
LDAP_BIND_DN="ou=archivebox,ou=services,dc=ldap.example.com"
LDAP_BIND_PASSWORD="secret-bind-user-password"
LDAP_USER_BASE="ou=users,ou=archivebox,ou=services,dc=ldap.example.com"
LDAP_USER_FILTER="(objectClass=user)"

LDAP_USERNAME_ATTR="uid"
LDAP_FIRSTNAME_ATTR="givenName"
LDAP_LASTNAME_ATTR="sn"
LDAP_EMAIL_ATTR="mail"
```

More info:

- [Configuration: LDAP](Configuration.md#ldap)
- https://github.com/ArchiveBox/ArchiveBox/pull/1214
- https://github.com/django-auth-ldap/django-auth-ldap#example-configuration

### Not Yet Supported: SAML / OAuth2 / OpenID Authentication

> _We'd welcome PRs to add support for these using `django-allauth`!_

These methods are not natively supported by ArchiveBox at the moment. However it is still possible to use them with ArchiveBox by running your own IdP server (e.g. [Authentik](https://docs.goauthentik.io/docs/providers/saml/), [Authelia](https://www.authelia.com/), [oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy)).

---

## REST API

The REST API (available starting in v0.8.0) supports several methods of authentication.

To see API docs and try endpoints interactively, visit: [`http://127.0.0.1:8000/api/v1/docs`](http://127.0.0.1:8000/api/v1/docs)

To generate an API key for your user, visit:  
[`http://127.0.0.1:8000/admin/api/apitoken/add/`](http://127.0.0.1:8000/admin/api/apitoken/add/)

or call the `get_api_token` endpoint:

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/api/v1/auth/get_api_token' \
  -H 'Content-Type: application/json' \
  -d '{"username": "YOURUSERNAMEHERE", "password": "YOURPASSWORDHERE"}'
```

> **Tip:** Bearer Tokens are the recommended method for the best balance of security and convenience.

### API Bearer Token Authentication

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/api/v1/core/snapshots?limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOURAPITOKENHERE'
```

### API Request Header Authentication

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/api/v1/core/snapshots?limit=10' \
  -H 'accept: application/json' \
  -H 'X-ArchiveBox-API-Key: YOURAPITOKENHERE'
```

### API Query Parameter Authentication

> **Warning:** This method is known as "Capability URLs" and comes with important security caveats. Not recommended unless you fully understand the risks.

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/api/v1/core/snapshots?limit=10&api_key=YOURAPITOKENHERE' \
  -H 'accept: application/json'
```

#### Further Reading

- [archivebox/api/auth.py](https://github.com/ArchiveBox/ArchiveBox/blob/dev/archivebox/api/auth.py)
- The [`django-ninja` auth documentation](https://django-ninja.dev/guides/authentication/)
