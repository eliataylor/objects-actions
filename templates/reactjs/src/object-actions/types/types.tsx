type CRUDVerb = 'add' | 'edit' | 'delete';
type FormObjectId = `${string}/${number}`;
type NestedObjectIds<T extends string> =
  T extends `${FormObjectId}/${infer Rest}` ?
  `${FormObjectId}/${NestedObjectIds<Rest>}` :
  T;

// Type for the full URL pattern with optional nested pairs
export type FormURL<T extends string> = `/forms/${NestedObjectIds<T>}/${CRUDVerb}`;

// type ExampleUpdateURL = FormURL<'user/123/profile/456/settings/789', 'update'>;  // "/forms/user/123/profile/456/settings/789/update"
// type ExampleCreateURL = FormURL<'product/0', 'create'>;  // "/forms/product/1/create"

interface ParsedURL {
    object: string;
    id: number;
    verb: CRUDVerb;
}

export function parseFormURL(url: string): ParsedURL | null {
    // Regular expression to capture object/id pairs and the verb
    const pattern = /^\/forms(\/[a-zA-Z0-9]+\/\d+)+(\/(add|edit|delete))$/;
    const match = url.match(pattern);

    if (!match) {
        return null; // URL does not match the expected pattern
    }

    // Extract the object/id pairs and verb from the URL
    const segments = url.split('/');
    const verb = segments.pop() as CRUDVerb; // The last segment is the verb
    segments.shift(); // Remove the empty initial segment (before 'forms')
    segments.shift(); // Remove the 'forms' segment

    // Extract the last object/id pair
    const id = parseInt(segments.pop() as string, 10); // The second last segment is the ID
    const object = segments.pop() as string; // The third last segment is the object

    return { object, id, verb };
}


//---OBJECT-ACTIONS-TYPE-SCHEMA-STARTS---//
interface Customer {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	readonly id?: number | null;
	user_id?: RelEntity | null;
	phone: string;
	email: string;
	billing_name?: string | null;
	billing_address?: string | null;
	delivery_address?: string | null;
}
interface Supplier {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	readonly id?: string | null;
	name: string;
	photo?: string | null;
	address?: string | null;
	website?: string | null;
}
interface Ingredient {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	readonly id?: string | null;
	title: string;
	image?: string | null;
	supplier?: RelEntity | null;
	seasonal?: boolean | null;
	in_season_price?: number | null;
	out_of_season_price?: number | null;
}
interface Meal {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	readonly id?: string | null;
	title: string;
	description: string;
	bld: string;
	photo?: string[] | null;
	internal_cost?: number | null;
	public_price?: number | null;
	ingredients?: RelEntity | null;
	suppliers?: RelEntity | null;
}
interface Plan {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	readonly id: string;
	name: string;
	description?: string | null;
	meals: RelEntity;
	price?: number | null;
	date?: string | null;
}
interface OrderItem {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	readonly id?: number | null;
	date: string;
	delivery_date: string;
	meal?: RelEntity | null;
	meal_menu?: RelEntity | null;
	servings: number;
}
interface Order {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	readonly id?: number | null;
	customer: RelEntity;
	created_date: string;
	start_date: string;
	final_price: number;
	delivery_instructions?: string | null;
	customizations: string;
	glass_containers?: boolean | null;
	recurring?: boolean | null;
	order_items: RelEntity;
	status: string;
}
//---OBJECT-ACTIONS-TYPE-SCHEMA-ENDS---//



//---OBJECT-ACTIONS-API-RESP-STARTS---//
export interface RelEntity {
    id: string | number;
    str: string;
    _type: string;
}

export interface ListView {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<Customer | Supplier | Ingredient | Meal | Plan | OrderItem | Order>
}

export type EntityView = Customer | Supplier | Ingredient | Meal | Plan | OrderItem | Order;

export function getProp<T extends EntityView, K extends keyof T>(entity: EntityView, key: string): T[K] | null {
    // @ts-ignore
    if (key in entity) return entity[key]
	return null;
}
//---OBJECT-ACTIONS-API-RESP-ENDS---//



//---OBJECT-ACTIONS-NAV-ITEMS-STARTS---//
export interface NavItem {
        name: string;
        screen: string;
        api: string;
        type: string;
}
export const NAVITEMS: NavItem[] = [
  {
    "name": "Customer",
    "type": "Customer",
    "api": "/api/customer",
    "screen": "/customer"
  },
  {
    "name": "Supplier",
    "type": "Supplier",
    "api": "/api/supplier",
    "screen": "/supplier"
  },
  {
    "name": "Ingredient",
    "type": "Ingredient",
    "api": "/api/ingredient",
    "screen": "/ingredient"
  },
  {
    "name": "Meal",
    "type": "Meal",
    "api": "/api/meal",
    "screen": "/meal"
  },
  {
    "name": "Plan",
    "type": "Plan",
    "api": "/api/plan",
    "screen": "/plan"
  },
  {
    "name": "Order Item",
    "type": "OrderItem",
    "api": "/api/order_item",
    "screen": "/order_item"
  },
  {
    "name": "Order",
    "type": "Order",
    "api": "/api/order",
    "screen": "/order"
  }
]
//---OBJECT-ACTIONS-NAV-ITEMS-ENDS---//















//---OBJECT-ACTIONS-TYPE-CONSTANTS-STARTS---//
export interface FieldTypeDefinition {
    machine: string;
    singular: string;
    plural: string;
    data_type: string;
    field_type: string;
    cardinality?: number;
    relationship?: string;
    required?: boolean;
    default?: string;
    example?: string;
    options?: object;
}
interface ObjectOfObjects {
    [key: string]: { [key: string]: FieldTypeDefinition };
}
export const TypeFieldSchema: ObjectOfObjects = {
  "Customer": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "id_auto_increment",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "user_id": {
      "machine": "user_id",
      "singular": "User ID",
      "plural": "User IDs",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "phone": {
      "machine": "phone",
      "singular": "Phone",
      "plural": "Phones",
      "field_type": "phone",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "email": {
      "machine": "email",
      "singular": "Email",
      "plural": "Emails",
      "field_type": "email",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "billing_name": {
      "machine": "billing_name",
      "singular": "Billing Name",
      "plural": "Billing Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "billing_address": {
      "machine": "billing_address",
      "singular": "Billing Addres",
      "plural": "Billing Address",
      "field_type": "address",
      "data_type": "string",
      "cardinality": Infinity,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "delivery_address": {
      "machine": "delivery_address",
      "singular": "Delivery Addres",
      "plural": "Delivery Address",
      "field_type": "address",
      "data_type": "string",
      "cardinality": Infinity,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Supplier": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "slug",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "name",
      "required": false,
      "example": ""
    },
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "photo": {
      "machine": "photo",
      "singular": "Photo",
      "plural": "Photos",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": "media/suppliers"
    },
    "address": {
      "machine": "address",
      "singular": "Addres",
      "plural": "Address",
      "field_type": "address",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "website": {
      "machine": "website",
      "singular": "Website",
      "plural": "Websites",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Ingredient": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "slug",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "title",
      "required": false,
      "example": ""
    },
    "title": {
      "machine": "title",
      "singular": "Title",
      "plural": "Titles",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "image": {
      "machine": "image",
      "singular": "Image",
      "plural": "Images",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": "media/ingredients"
    },
    "supplier": {
      "machine": "supplier",
      "singular": "Supplier",
      "plural": "Suppliers",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "supplier",
      "default": "",
      "required": false,
      "example": ""
    },
    "seasonal": {
      "machine": "seasonal",
      "singular": "Seasonal",
      "plural": "Seasonals",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "in_season_price": {
      "machine": "in_season_price",
      "singular": "In season Price",
      "plural": "In season Prices",
      "field_type": "decimal",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "out_of_season_price": {
      "machine": "out_of_season_price",
      "singular": "Out of season price",
      "plural": "Out of season prices",
      "field_type": "decimal",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Meal": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "slug",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "title",
      "required": false,
      "example": ""
    },
    "title": {
      "machine": "title",
      "singular": "Title",
      "plural": "Titles",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "description": {
      "machine": "description",
      "singular": "Description",
      "plural": "Descriptions",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "bld": {
      "machine": "bld",
      "singular": "BLD",
      "plural": "BLDs",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": "['breakfast', 'lunch', 'dinner', 'desert', 'snack']",
      "options": [
        {
          "label": "Breakfast",
          "id": "breakfast"
        },
        {
          "label": "Lunch",
          "id": "lunch"
        },
        {
          "label": "Dinner",
          "id": "dinner"
        },
        {
          "label": "Desert",
          "id": "desert"
        },
        {
          "label": "Snack",
          "id": "snack"
        }
      ]
    },
    "photo": {
      "machine": "photo",
      "singular": "Photo",
      "plural": "Photos",
      "field_type": "media",
      "data_type": "string",
      "cardinality": 3,
      "relationship": "",
      "default": "",
      "required": false,
      "example": "media/calendar"
    },
    "internal_cost": {
      "machine": "internal_cost",
      "singular": "Internal Cost",
      "plural": "Internal Costs",
      "field_type": "decimal",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "public_price": {
      "machine": "public_price",
      "singular": "Public Price",
      "plural": "Public Prices",
      "field_type": "decimal",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "16",
      "required": false,
      "example": ""
    },
    "ingredients": {
      "machine": "ingredients",
      "singular": "Ingredient",
      "plural": "Ingredients",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "ingredient",
      "default": "",
      "required": false,
      "example": ""
    },
    "suppliers": {
      "machine": "suppliers",
      "singular": "Supplier",
      "plural": "Suppliers",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "supplier",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Plan": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "slug",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "name",
      "required": true,
      "example": ""
    },
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "description": {
      "machine": "description",
      "singular": "Description",
      "plural": "Descriptions",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "meals": {
      "machine": "meals",
      "singular": "Meal",
      "plural": "Meals",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "meal",
      "default": "",
      "required": true,
      "example": ""
    },
    "price": {
      "machine": "price",
      "singular": "Price",
      "plural": "Prices",
      "field_type": "price",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": "USD"
    },
    "date": {
      "machine": "date",
      "singular": "Date",
      "plural": "Dates",
      "field_type": "date",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "OrderItem": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "id_auto_increment",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "date": {
      "machine": "date",
      "singular": "Date",
      "plural": "Dates",
      "field_type": "date",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "delivery_date": {
      "machine": "delivery_date",
      "singular": "Delivery Date",
      "plural": "Delivery Dates",
      "field_type": "date",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "meal": {
      "machine": "meal",
      "singular": "Meal",
      "plural": "Meals",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "meal",
      "default": "",
      "required": false,
      "example": ""
    },
    "meal_menu": {
      "machine": "meal_menu",
      "singular": "Meal Menu",
      "plural": "Meal Menus",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "plan",
      "default": "",
      "required": false,
      "example": ""
    },
    "servings": {
      "machine": "servings",
      "singular": "Serving",
      "plural": "Servings",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "1",
      "required": true,
      "example": ""
    }
  },
  "Order": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "id_auto_increment",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "customer": {
      "machine": "customer",
      "singular": "Customer",
      "plural": "Customers",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "customer",
      "default": "",
      "required": true,
      "example": ""
    },
    "created_date": {
      "machine": "created_date",
      "singular": "Created Date",
      "plural": "Created Dates",
      "field_type": "date",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "start_date": {
      "machine": "start_date",
      "singular": "Start Date",
      "plural": "Start Dates",
      "field_type": "date",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "final_price": {
      "machine": "final_price",
      "singular": "Final Price",
      "plural": "Final Prices",
      "field_type": "decimal",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "delivery_instructions": {
      "machine": "delivery_instructions",
      "singular": "Delivery Instruction",
      "plural": "Delivery Instructions",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "customizations": {
      "machine": "customizations",
      "singular": "Customization",
      "plural": "Customizations",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "glass_containers": {
      "machine": "glass_containers",
      "singular": "Glass Container",
      "plural": "Glass Containers",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "relationship": "",
      "default": "0",
      "required": false,
      "example": ""
    },
    "recurring": {
      "machine": "recurring",
      "singular": "Recurring",
      "plural": "Recurrings",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "relationship": "",
      "default": "0",
      "required": false,
      "example": ""
    },
    "order_items": {
      "machine": "order_items",
      "singular": "Order Item",
      "plural": "Order Items",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "order_item",
      "default": "",
      "required": true,
      "example": ""
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Status",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "unpaid",
      "required": true,
      "example": "['paid', 'cancelled', 'unpaid']",
      "options": [
        {
          "label": "Paid",
          "id": "paid"
        },
        {
          "label": "Cancelled",
          "id": "cancelled"
        },
        {
          "label": "Unpaid",
          "id": "unpaid"
        }
      ]
    }
  }
}
//---OBJECT-ACTIONS-TYPE-CONSTANTS-ENDS---//































































































