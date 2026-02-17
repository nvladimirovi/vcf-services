# API extensibility

The API extensibility framework gives providers the ability to extend the standard API included with VMware Cloud Foundation Automation through a set of well established rules that allow the registration of external systems with the platform and the association of those systems with URLs which are serviced by VMware Cloud Foundation Automation. Requests made to such URLs are routed to the corresponding external system (API extension) for processing.

The API extensibility via HTTP framework is suitable for integrating VMware Cloud Foundation Automation with third party products by providing easy relay to the product's API/UI. However, tenancy integration may be needed in the third-party product.

The two main concepts in the API extensibility framework are the [External System](#external-system) and the [API filter](#api-filter).

***External System*** = where requests go for processing

***API Filter*** = a rule for which requests go where

## External System

The external system represents an external to VMware Cloud Foundation Automation system which processes API extensibility requests by communicating with VMware Cloud Foundation Automation via HTTP.

## API Filter

API filters allow external systems to extend the standard API included with VMware Cloud Foundation Automation with custom URLs or custom processing of request's responses.

The API filter entity has the following definition:

```json
{
    "externalSystem": {
        "id": "urn:vcloud:extension-api:vmware:test:1.0.0",
        "name": "test"
    },
    "urlMatcher": {
        "urlPattern": "/test/.*",
        "urlScope": "API"
    }

}
```

- externalSystem - an entity reference to an external endpoint 
- urlMatcher - used to set a custom URL which when requested, will be processed by the external system. More details [here](#the-urlmatcher).

### The urlMatcher

The `urlMatcher` consists of `urlPattern` and `urlScope` which together identify a URL which will be serviced by an external system. 

#### External Endpoints and the urlMatcher

The `urlMatcher` will matches under the extensibility API endpoints:

- `/proxy/external-endpoint/api`
- `/proxy/external-endpoint/ui/provider`
- `/proxy/external-endpoint/ui/tenant`

The allowed values for `urlScope` are `EXT_API`, `EXT_UI_PROVIDER`, `EXT_UI_TENANT` corresponding to `/proxy/external-endpoint/api`, `/proxy/external-endpoint/ui/provider`, `/proxy/external-endpoint/ui/tenant`.

The `urlPattern` is a regular expression pattern. Element content cannot exceed 1024 characters. The urlPattern must end with `.*` which specifies that the part of the URL coming after will be redirected to an external endpoint.

Example `urlMatcher`:

```json
{
    "urlPattern": "/custom/.*",
    "urlScope": "EXT_API"
}
```

With the above `urlMatcher`:

- `/proxy/external-endpoint/api/custom/createObject` will be redirected to `<ext-endpoint-root-url>/createObject`
- `/proxy/external-endpoint/api/custom/get/123` will be redirected to `<ext-endpoint-root-url>/get/123`
- `/proxy/external-endpoint/api/custom/` will be redirected to `<ext-endpoint-root-url>`

Example `urlMatcher`:

```json
{
    "urlPattern": "/custom/test/.*",
    "urlScope": "EXT_UI_TENANT"
}
```

The following URLs will be matched by this `urlMatcher`:

- `/proxy/external-endpoint/ui/tenant/custom/test/createObject` will be redirected to `<ext-endpoint-root-url>/createObject`
- `/proxy/external-endpoint/ui/tenant/custom/test/` will be redirected to `<ext-endpoint-root-url>`

## API extensibility via HTTP

### HTTP Extensibility Overview

As the name suggests, the API extensibility via HTTP framework uses **HTTP** as a form of communication between VMware Cloud Foundation Automation and the external systems. We call such external systems which communicate with VMware Cloud Foundation Automation over HTTP [External Endpoints](#external-endpoint).

"Extending the VMware Cloud Foundation Automation standard API" with custom request processing by an external endpoint can be achieved by [Registering a **custom URL**](#registering-custom-urls-to-be-serviced-by-the-external-endpoint) to be serviced by an external endpoint. All requests made to this URL will be routed to the external endpoint for processing and the response will be propagated back to the caller.

### Get started with HTTP Extensibility

We will get started with a simple example and build on top of it while going through the specifics of API extensibility via HTTP.

Let us go through the main concepts first:

- [External Endpoint](#external-service)

If instead you wish to start with the basic example, skip to [here](#building-an-api-extension-via-http-http-transparent-proxy).

### External Endpoint

Any external to VMware Cloud Foundation Automation system which needs to be able to process custom API requests via HTTP needs to be registered as an **external endpoint** in VMware Cloud Foundation Automation.

The external endpoint entity has the following definition:

```json
{
    "name": "endpointName",
    "version": "1.0.0",
    "vendor": "vmware",
    "rootUrl": "https://externalHost.com",
    "enabled": true
}
```

The vendor, name and version trio is unique for each external endpoint.

- **enabled** - true/false (a user provided field) - whether the external endpoint is enabled or not
- **rootUrl** - String - the external endpoint which requests will be redirected to. The rootUrl must be a valid URL of https protocol. In order for VMware Cloud Foundation Automation to be able to connect to the external endpoint its server certificate has to be [trusted in VMware Cloud Foundation Automation's Provider Portal](https://techdocs.broadcom.com/us/en/vmware-cis/vcf/vcf-9-0-and-later/9-0/provider-management/managing-certificates.html).

#### Enabled vs disabled external endpoints

If the external endpoint is not enabled, requests will not be routed to it for processing. VMware Cloud Foundation Automation acts as if the endpoint does not exist. An external endpoint must be disabled before being deleted.

### Authorization of custom URL requests

Requests made to custom URL requests in VMware Cloud Foundation Automation which proxy requests to an external endpoint can be made by any valid VMware Cloud Foundation Automation user.

Requests made to all proxy endpoints must contain either a `Authorization` header with a valid VCFA JWT token or a `vcloud_jwt` cookie with a valid VCFA JWT token.

### Building an API extension via HTTP (HTTP Transparent Proxy)

#### Registering a new external endpoint

The first thing you need to do to build an API extension via HTTP is to register the extension in VMware Cloud Foundation Automation by registering an external endpoint.

Registering an external endpoint is done with the following API call ([more info](#external-endpoint)):

```text
POST /cloudapi/1.0.0/externalEndpoints
Accept: application/json;version=40.1
Content-Type: application/json;version=40.1
```

```json
{
    "name": "endpointName",
    "version": "1.0.0",
    "vendor": "vmware",
    "rootUrl": "https://externalHost.com",
    "enabled": true
}
  ```

Response:

```json
{
    "id": "urn:vcloud:extensionEndpoint:vmware:endpointName:1.0.0",
    "name": "endpointName",
    "version": "1.0.0",
    "vendor": "vmware",
    "rootUrl": "https://externalHost.com",
    "enabled": true
}
```

#### Registering custom URLs to be serviced by the external endpoint

Now that we have registered an external endpoint, we can create custom URLs in VMware Cloud Foundation Automation to be serviced by this external endpoint. To put it in other words, we need to create a rule in VMware Cloud Foundation Automation for which requests will be proxied to the external endpoint for processing. And the way to do that is to create an API filter in VMware Cloud Foundation Automation.

Creating an API filter is done with the following API call ([more info](#api-filter)):

```json
POST /cloudapi/1.0.0/apiFilters

{
    "externalSystem": {
        "id": "urn:vcloud:extensionEndpoint:vmware:endpointName:1.0.0",
        "name": "endpointName"
    },
    "urlMatcher": {
        "urlPattern": "/custom/.*",
        "urlScope": "EXT_API"
    }
}

```

The above created API filter says that all requests which have a URL with prefix `/proxy/external-endpoint/api/` will be redirected to the external endpoint with id `urn:vcloud:extensionEndpoint:vmware:endpointName:1.0.0`. If we use the example above with urlPattern `/custom/.*`:

Request to VMware Cloud Foundation Automation:

```text
POST https://<vcfa-host>/proxy/external-endpoint/api/custom/createObject/test123?param1=param1
```

Request to external endpoint:

```text
POST https://externalHost.com/createObject/test123?param1=param1
```

#### Sending requests to the external endpoint

After creating an External Endpoint (enabled) and an API filter, the setup for setting up an HTTP Proxy is complete. A logged in user can start sending requests.

Example with the above configurations:

```json
Request to VMware Cloud Foundation Automation:
POST https://<vcfa-host>/ext-api/test/123?param1=param1
Headers:
...
Authorization: Bearer ...
...
Body:
{
    "test": "123"
}

Request external endpoint receives:
POST https://externalHost.com/test/123?param1=param1
Headers:
...
Body:
{
"test": "123"
}
```