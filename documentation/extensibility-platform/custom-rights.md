# Custom Rights and Rights Categories

## Prerequisites
You need to get familiar with the core concepts of [the RBAC model of VCFA](https://techdocs.broadcom.com/us/en/vmware-cis/vcf/vcf-9-0-and-later/9-0/provider-management/managing-system-administrators-and-roles.html) in order to understand the custom rigths and rights categories feature.

## Overview

The Custom Rights and Rights Categories feature allows VCF Services to add custom rights in VCFA. The custom rights created act as any other built-in right in the system - they can be added to rights bundles and roles and assigned to any VCFA user (via roles).

## Managing Custom Rights

Custom Rights are created and deleted via the API. They can be created in either 
- a built-in right category
- a custom category under `OTHER`
- [a fully custom rights category](#managing-custom-rights-categories)

All custom rights are created within the scope of a `serviceNamespace`. 

Rights implications can be defined between custom rights and other custom rights or built-in rights in VCFA. Transitive implications do not need to be explicitely defined - if custom right 1 is defined to imply right 2 and right 2 implies right 3, then once created, custom right 1 will imply both right 2 and right 3.

Custom Rights are visualized in the Access Control section of the VCFA Provider and Tenant Portals.

### Create a custom right in a custom category under `OTHER`
```
POST https://<<vcfa_host>>/cloudapi/1.0.0/rights
```
```json
{
  "name": "View Clusters",
  "description": "View Clusters",
  "bundleKey": "RIGHT_VKSM_CLUSTER_VIEW",
  "serviceNamespace": "urn:vcloud:service:ClusterManagement",
  "rightType": "VIEW",
  "isPublishable": true
}
```

Response `201`:
```json
{
  "name": "View Clusters",
  "id": "urn:vcloud:right:681499c5-3a04-4ab2-8910-c6ce690b8989",
  "description": "View Clusters",
  "bundleKey": "RIGHT_VKSM_CLUSTER_VIEW",
  "category": "urn:vcloud:rightsCategory:8f59bb64-64bd-5fed-8316-ba114b033465",
  "serviceNamespace": "urn:vcloud:service:ClusterManagement",
  "rightType": "VIEW",
  "impliedRights": null,
  "isPublishable": null
}
```

### Create a custom right in a specific right category (built-in or custom)
```
POST https://<<vcfa_host>>/cloudapi/1.0.0/rights
```
```json
{
  "name": "Manage Clusters",
  "description": "Manage Clusters",
  "bundleKey": "RIGHT_VKSM_CLUSTER_VIEW",
  "category": "urn:vcloud:rightsCategory:0449e100-3dd0-5dd9-aab1-63e844540614",
  "serviceNamespace": "urn:vcloud:service:ClusterManagement",
  "rightType": "MODIFY",
  "isPublishable": true
}
```

Response `201`:
```json
{
  "name": "Manage Clusters",
  "id": "urn:vcloud:right:a13d30ec-11d8-405c-8655-1fddc07bbe93",
  "description": "Manage Clusters",
  "bundleKey": "RIGHT_VKSM_CLUSTER_VIEW",
  "category": "urn:vcloud:rightsCategory:0449e100-3dd0-5dd9-aab1-63e844540614",
  "serviceNamespace": "urn:vcloud:service:ClusterManagement",
  "rightType": "MODIFY",
  "impliedRights": null,
  "isPublishable": null
}
```

### Create a custom right without rights implications
```
POST https://<<vcfa_host>>/cloudapi/1.0.0/rights
```
```json
{
  "name": "View Encryption Classes",
  "description": "View Encryption Classes",
  "bundleKey": "RIGHT_ENCRYPTION_CLASSES_VIEW",
  "serviceNamespace": "urn:vcloud:service:EncryptionManagement",
  "category": "urn:vcloud:rightsCategory:c799ec1e-6e30-57b0-98e8-21a911f43d96",
  "rightType": "VIEW",
  "isPublishable": true
}
```

Response `201`:
```json
{
  "name": "View Encryption Classes",
  "id": "urn:vcloud:right:22d28531-1091-4e90-ad27-f582fb3df54b",
  "description": "View Encryption Classes",
  "bundleKey": "RIGHT_ENCRYPTION_CLASSES_VIEW",
  "serviceNamespace": "urn:vcloud:service:EncryptionManagement",
  "category": "urn:vcloud:rightsCategory:c799ec1e-6e30-57b0-98e8-21a911f43d96",
  "rightType": "VIEW",
  "isPublishable": true
}
```

### Create a custom right implicating another custom right
```
POST https://<<vcfa_host>>/cloudapi/1.0.0/rights
```
```json
{
  "name": "Manage Encryption Classes",
  "description": "Manage Encryption Classes",
  "bundleKey": "RIGHT_ENCRYPTION_CLASSES_MANAGE",
  "serviceNamespace": "urn:vcloud:service:EncryptionManagement",
  "rightType": "MODIFY",
  "category": "urn:vcloud:rightsCategory:c799ec1e-6e30-57b0-98e8-21a911f43d96",
  "isPublishable": true,
  "impliedRights": [
    {
      "id": "urn:vcloud:right:22d28531-1091-4e90-ad27-f582fb3df54b"
    }
  ]
}
```
Response `201`:
```json
{
  "name": "Manage Encryption Classes",
  "id": "urn:vcloud:right:97e0533d-ccd0-46d6-b170-2fb52cd7f615",
  "description": "Manage Encryption Classes",
  "bundleKey": "RIGHT_ENCRYPTION_CLASSES_MANAGE",
  "serviceNamespace": "urn:vcloud:service:EncryptionManagement",
  "rightType": "MODIFY",
  "category": "urn:vcloud:rightsCategory:c799ec1e-6e30-57b0-98e8-21a911f43d96",
  "impliedRights": [
    {
      "name": "View Encryption Classes",
      "id": "urn:vcloud:right:22d28531-1091-4e90-ad27-f582fb3df54b"
    }
  ],
  "isPublishable": true
}
```
### Delete a custom right
```
DELETE https://<<vcfa_host>>:<<vcfa_port>>/cloudapi/1.0.0/rights/urn:vcloud:right:b48ec60e-48ee-46bf-aff9-9b5eab626cf3
```
Response `204`.

[Rights API Reference](https://developer.broadcom.com/xapis/provider-infrastructure-apis/latest/rights/)

## Managing Custom Rights Categories

Custom Rights Categories are created and deleted via the API. Custom Rights Categories can be created as either top-level or second-level categories.

All custom rights catgories are created within the scope of a `serviceNamespace`. 

### Create a top-level custom rights category
```
POST https://<<vcfa_host>>/cloudapi/1.0.0/rightsCategories
```
```json
{
  "name": "Encryption Management",
  "description": "Encryption Management",
  "bundleKey": "RIGHTS_CATEGORY_ENCRYPTION_MANAGEMENT",
  "serviceNamespace": "urn:vcloud:service:EncryptionManager"
}
```
Response `201`:
```json
{
  "name": "Encryption Management",
  "id": "urn:vcloud:rightsCategory:14076173-7e5d-5b0b-aeb9-4a166b474a70",
   "description": "Encryption Management",
  "bundleKey": "RIGHTS_CATEGORY_ENCRYPTION_MANAGEMENT",
  "parent": null,
  "serviceNamespace": "urn:vcloud:service:EncryptionManager",
  "rightsCount": {
    "view": 0,
    "modify": 0
  },
  "subCategories": []
}
```

### Create a second-level custom rights category
```
POST https://<<vcfa_host>>/cloudapi/1.0.0/rightsCategories
```
```json
{
  "name": "Encryption Classes",
  "description": "Encryption Classes Rights",
  "bundleKey": "RIGHTS_CATEGORY_ENCRYPTION_MANAGEMENT",
  "serviceNamespace": "urn:vcloud:service:EncryptionManager",
  "parent": "urn:vcloud:rightsCategory:14076173-7e5d-5b0b-aeb9-4a166b474a70"
}
```
Response `201`:
```json
{
  "name": "Cluster Management",
  "id": "urn:vcloud:rightsCategory:5008b571-a338-4c4e-bfbd-d18b89329fc7",
  "description": null,
  "bundleKey": "RIGHTS_CATEGORY_ENCRYPTION_MANAGEMENT",
  "parent": "urn:vcloud:rightsCategory:e4d0443d-21c8-4373-9b8f-81a0a650b836",
  "serviceNamespace": "urn:vcloud:service:EncryptionManager",
  "rightsCount": {
    "view": 0,
    "modify": 0
  },
  "subCategories": []
}
```

### Delete a custom rights category
```
DELETE https://<<vcfa_host>>/cloudapi/1.0.0/rights/urn:vcloud:right:b48ec60e-48ee-46bf-aff9-9b5eab626cf3
```

[Rights Categories API Reference](https://developer.broadcom.com/xapis/provider-infrastructure-apis/latest/rights-categories/)

