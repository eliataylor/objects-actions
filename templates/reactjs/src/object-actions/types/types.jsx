"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeFieldSchema = exports.NAVITEMS = exports.parseFormURL = void 0;
function parseFormURL(url) {
    // Regular expression to capture object/id pairs and the verb
    const pattern = /^\/forms(\/[a-zA-Z0-9]+\/\d+)+(\/(add|edit|delete))$/;
    const match = url.match(pattern);
    if (!match) {
        return null; // URL does not match the expected pattern
    }
    // Extract the object/id pairs and verb from the URL
    const segments = url.split('/');
    const verb = segments.pop(); // The last segment is the verb
    segments.shift(); // Remove the empty initial segment (before 'forms')
    segments.shift(); // Remove the 'forms' segment
    // Extract the last object/id pair
    const id = parseInt(segments.pop(), 10); // The second last segment is the ID
    const object = segments.pop(); // The third last segment is the object
    return { object, id, verb };
}
exports.parseFormURL = parseFormURL;
exports.NAVITEMS = [
    {
        "name": "Customer",
        "class": "customer",
        "api": "/api/customer",
        "screen": "/customer"
    },
    {
        "name": "Supplier",
        "class": "supplier",
        "api": "/api/supplier",
        "screen": "/supplier"
    },
    {
        "name": "Ingredient",
        "class": "ingredient",
        "api": "/api/ingredient",
        "screen": "/ingredient"
    },
    {
        "name": "Meal",
        "class": "meal",
        "api": "/api/meal",
        "screen": "/meal"
    },
    {
        "name": "Plan",
        "class": "plan",
        "api": "/api/plan",
        "screen": "/plan"
    },
    {
        "name": "Order Item",
        "class": "order_item",
        "api": "/api/order_item",
        "screen": "/order_item"
    },
    {
        "name": "Order",
        "class": "order",
        "api": "/api/order",
        "screen": "/order"
    }
];
exports.TypeFieldSchema = {
    "customer": {
        "id": {
            "machine": "id",
            "label": "ID",
            "data_type": "string",
            "field_type": "ID (auto increment)",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "user_id": {
            "machine": "user_id",
            "label": "User ID",
            "data_type": "string",
            "field_type": "User (cms)",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "phone": {
            "machine": "phone",
            "label": "Phone",
            "data_type": "string",
            "field_type": "phone",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "email": {
            "machine": "email",
            "label": "Email",
            "data_type": "string",
            "field_type": "email",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "billing_name": {
            "machine": "billing_name",
            "label": "Billing Name",
            "data_type": "string",
            "field_type": "text",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "billing_address": {
            "machine": "billing_address",
            "label": "Billing Address",
            "data_type": "string",
            "field_type": "address",
            "cardinality": Infinity,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "delivery_address": {
            "machine": "delivery_address",
            "label": "Delivery Address",
            "data_type": "string",
            "field_type": "address",
            "cardinality": Infinity,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        }
    },
    "supplier": {
        "id": {
            "machine": "id",
            "label": "ID",
            "data_type": "string",
            "field_type": "slug",
            "cardinality": 1,
            "relationship": "",
            "default": "name",
            "required": false,
            "example": ""
        },
        "name": {
            "machine": "name",
            "label": "Name",
            "data_type": "string",
            "field_type": "text",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "photo": {
            "machine": "photo",
            "label": "Photo",
            "data_type": "string",
            "field_type": "image",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": "media/suppliers"
        },
        "address": {
            "machine": "address",
            "label": "Address",
            "data_type": "string",
            "field_type": "address",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "website": {
            "machine": "website",
            "label": "Website",
            "data_type": "string",
            "field_type": "URL",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        }
    },
    "ingredient": {
        "id": {
            "machine": "id",
            "label": "ID",
            "data_type": "string",
            "field_type": "slug",
            "cardinality": 1,
            "relationship": "",
            "default": "title",
            "required": false,
            "example": ""
        },
        "title": {
            "machine": "title",
            "label": "Title",
            "data_type": "string",
            "field_type": "text",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "image": {
            "machine": "image",
            "label": "Image",
            "data_type": "string",
            "field_type": "image",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": "media/ingredients"
        },
        "supplier": {
            "machine": "supplier",
            "label": "Supplier",
            "data_type": "string",
            "field_type": "type reference",
            "cardinality": 1,
            "relationship": "Supplier",
            "default": "",
            "required": false,
            "example": ""
        },
        "seasonal": {
            "machine": "seasonal",
            "label": "Seasonal",
            "data_type": "boolean",
            "field_type": "boolean",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "in_season_price": {
            "machine": "in_season_price",
            "label": "In season Price",
            "data_type": "number",
            "field_type": "decimal",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "out_of_season_price": {
            "machine": "out_of_season_price",
            "label": "Out of season price",
            "data_type": "number",
            "field_type": "decimal",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        }
    },
    "meal": {
        "id": {
            "machine": "id",
            "label": "ID",
            "data_type": "string",
            "field_type": "slug",
            "cardinality": 1,
            "relationship": "",
            "default": "title",
            "required": false,
            "example": ""
        },
        "title": {
            "machine": "title",
            "label": "Title",
            "data_type": "string",
            "field_type": "text",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "description": {
            "machine": "description",
            "label": "Description",
            "data_type": "string",
            "field_type": "text",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "bld": {
            "machine": "bld",
            "label": "BLD",
            "data_type": "string",
            "field_type": "enum",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": "['breakfast', 'lunch', 'dinner', 'desert', 'snack']"
        },
        "photo": {
            "machine": "photo",
            "label": "Photo",
            "data_type": "string",
            "field_type": "media",
            "cardinality": 3,
            "relationship": "",
            "default": "",
            "required": true,
            "example": "media/calendar"
        },
        "internal_cost": {
            "machine": "internal_cost",
            "label": "Internal Cost",
            "data_type": "number",
            "field_type": "decimal",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "public_price": {
            "machine": "public_price",
            "label": "Public Price",
            "data_type": "number",
            "field_type": "decimal",
            "cardinality": 1,
            "relationship": "",
            "default": "16",
            "required": false,
            "example": ""
        },
        "ingredients": {
            "machine": "ingredients",
            "label": "Ingredients",
            "data_type": "string",
            "field_type": "type reference",
            "cardinality": Infinity,
            "relationship": "Ingredient",
            "default": "",
            "required": false,
            "example": ""
        },
        "suppliers": {
            "machine": "suppliers",
            "label": "Suppliers",
            "data_type": "string",
            "field_type": "type reference",
            "cardinality": Infinity,
            "relationship": "Supplier",
            "default": "",
            "required": false,
            "example": ""
        }
    },
    "plan": {
        "id": {
            "machine": "id",
            "label": "ID",
            "data_type": "string",
            "field_type": "slug",
            "cardinality": 1,
            "relationship": "",
            "default": "name",
            "required": true,
            "example": ""
        },
        "name": {
            "machine": "name",
            "label": "Name",
            "data_type": "string",
            "field_type": "text",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "description": {
            "machine": "description",
            "label": "Description",
            "data_type": "string",
            "field_type": "textarea",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "meals": {
            "machine": "meals",
            "label": "Meals",
            "data_type": "string",
            "field_type": "type reference",
            "cardinality": Infinity,
            "relationship": "Meal",
            "default": "",
            "required": true,
            "example": ""
        },
        "price": {
            "machine": "price",
            "label": "Price",
            "data_type": "number",
            "field_type": "price",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": "USD"
        },
        "date": {
            "machine": "date",
            "label": "Date",
            "data_type": "string",
            "field_type": "date",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        }
    },
    "order_item": {
        "id": {
            "machine": "id",
            "label": "ID",
            "data_type": "string",
            "field_type": "ID (auto increment)",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "date": {
            "machine": "date",
            "label": "Date",
            "data_type": "string",
            "field_type": "date",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "delivery_date": {
            "machine": "delivery_date",
            "label": "Delivery Date",
            "data_type": "string",
            "field_type": "date",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "meal": {
            "machine": "meal",
            "label": "Meal",
            "data_type": "string",
            "field_type": "type reference",
            "cardinality": 1,
            "relationship": "Meal",
            "default": "",
            "required": false,
            "example": ""
        },
        "meal_menu": {
            "machine": "meal_menu",
            "label": "Meal Menu",
            "data_type": "string",
            "field_type": "type reference",
            "cardinality": 1,
            "relationship": "Plan",
            "default": "",
            "required": false,
            "example": ""
        },
        "servings": {
            "machine": "servings",
            "label": "Servings",
            "data_type": "number",
            "field_type": "integer",
            "cardinality": 1,
            "relationship": "",
            "default": "1",
            "required": true,
            "example": ""
        }
    },
    "order": {
        "id": {
            "machine": "id",
            "label": "ID",
            "data_type": "string",
            "field_type": "ID (auto increment)",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "customer": {
            "machine": "customer",
            "label": "Customer",
            "data_type": "string",
            "field_type": "User (custom)",
            "cardinality": 1,
            "relationship": "Customer",
            "default": "",
            "required": true,
            "example": ""
        },
        "created_date": {
            "machine": "created_date",
            "label": "Created Date",
            "data_type": "string",
            "field_type": "date",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "start_date": {
            "machine": "start_date",
            "label": "Start Date",
            "data_type": "string",
            "field_type": "date",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "final_price": {
            "machine": "final_price",
            "label": "Final Price",
            "data_type": "number",
            "field_type": "decimal",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "delivery_instructions": {
            "machine": "delivery_instructions",
            "label": "Delivery Instructions",
            "data_type": "string",
            "field_type": "textarea",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": false,
            "example": ""
        },
        "customizations": {
            "machine": "customizations",
            "label": "Customizations",
            "data_type": "string",
            "field_type": "textarea",
            "cardinality": 1,
            "relationship": "",
            "default": "",
            "required": true,
            "example": ""
        },
        "glass_containers": {
            "machine": "glass_containers",
            "label": "Glass Containers",
            "data_type": "boolean",
            "field_type": "boolean",
            "cardinality": 1,
            "relationship": "",
            "default": "0",
            "required": false,
            "example": ""
        },
        "recurring": {
            "machine": "recurring",
            "label": "Recurring",
            "data_type": "boolean",
            "field_type": "boolean",
            "cardinality": 1,
            "relationship": "",
            "default": "0",
            "required": false,
            "example": ""
        },
        "order_items": {
            "machine": "order_items",
            "label": "Order Items",
            "data_type": "string",
            "field_type": "type reference",
            "cardinality": Infinity,
            "relationship": "Order Item",
            "default": "",
            "required": true,
            "example": ""
        },
        "status": {
            "machine": "status",
            "label": "Status",
            "data_type": "string",
            "field_type": "enum",
            "cardinality": 1,
            "relationship": "",
            "default": "unpaid",
            "required": true,
            "example": "['paid', 'cancelled', 'unpaid']"
        }
    }
};
//---OBJECT-ACTIONS-TYPE-CONSTANTS-ENDS---//
