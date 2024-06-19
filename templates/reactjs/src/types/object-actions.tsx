

//---OBJECT-ACTIONS-TYPE-SCHEMA-STARTS---//
interface Customer {
	readonly id?: string | null;
	user_id?: string | null;
	phone: string;
	email: string;
	billing_name?: string | null;
	billing_address?: string | null;
	delivery_name?: string | null;
	delivery_address?: string | null;
}
interface Supplier {
	readonly id?: string | null;
	name: string;
	photo?: string | null;
	address?: string | null;
	website?: string | null;
}
interface Ingredient {
	readonly id?: string | null;
	title: string;
	image?: string | null;
	supplier?: string | null;
	seasonal?: boolean | null;
	in_season_price?: number | null;
	out_of_season_price?: number | null;
}
interface Meal {
	readonly id?: string | null;
	title: string;
	description: string;
	bld: string;
	photo: string;
	internal_cost?: number | null;
	public_price?: number | null;
	ingredients?: string[] | null;
	suppliers?: string[] | null;
}
interface Plan {
	readonly id: string;
	name: string;
	description?: string | null;
	meals: string[];
	price?: number | null;
	date?: string | null;
}
interface OrderItem {
	readonly id?: string | null;
	date: string;
	delivery_date: string;
	meal?: string | null;
	meal_menu?: string | null;
	servings: number;
}
interface Order {
	readonly id?: string | null;
	customer: string;
	created_date: string;
	start_date: string;
	final_price: number;
	delivery_instructions?: string | null;
	customizations: string;
	glass_containers?: boolean | null;
	recurring?: boolean | null;
	order_items: string[];
	status: string;
}
//---OBJECT-ACTIONS-TYPE-SCHEMA-ENDS---//



//---OBJECT-ACTIONS-API-RESP-STARTS---//
export interface ListView {
    meta: object;
    data: Array<Customer | Supplier | Ingredient | Meal | Plan | OrderItem | Order>
}

export interface EntityView {
    meta: object;
    data: Customer | Supplier | Ingredient | Meal | Plan | OrderItem | Order;
}

//---OBJECT-ACTIONS-API-RESP-ENDS---//



//---OBJECT-ACTIONS-NAV-ITEMS-STARTS---//
export interface NavItem {
    name: string;
    class: string;
    api: string;
    screen: string;
}
export const NAVITEMS: NavItem[] = [
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
]
//---OBJECT-ACTIONS-NAV-ITEMS-ENDS---//















//---OBJECT-ACTIONS-TYPE-CONSTANTS-STARTS---//
export interface FieldTypeDefinition {
    field_name: string;
    data_type: string;
    field_type: string;
    cardinality?: string | number;
    relationship?: string;
    default?: string;
    example?: string;
}
interface ObjectOfObjects {
    [key: string]: { [key: string]: FieldTypeDefinition };
}
export const TypeFieldSchema: ObjectOfObjects = {
  "customer": {
    "id": {
      "field_name": "id",
      "data_type": "string",
      "field_type": "ID (auto increment)",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "user_id": {
      "field_name": "user_id",
      "data_type": "string",
      "field_type": "User (cms)",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "phone": {
      "field_name": "phone",
      "data_type": "string",
      "field_type": "phone",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "email": {
      "field_name": "email",
      "data_type": "string",
      "field_type": "email",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "billing_name": {
      "field_name": "billing_name",
      "data_type": "string",
      "field_type": "text",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "billing_address": {
      "field_name": "billing_address",
      "data_type": "string",
      "field_type": "address",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "delivery_name": {
      "field_name": "delivery_name",
      "data_type": "string",
      "field_type": "text",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "delivery_address": {
      "field_name": "delivery_address",
      "data_type": "string",
      "field_type": "address",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    }
  },
  "supplier": {
    "id": {
      "field_name": "id",
      "data_type": "string",
      "field_type": "slug",
      "cardinality": "",
      "relationship": "",
      "default": "name",
      "example": ""
    },
    "name": {
      "field_name": "name",
      "data_type": "string",
      "field_type": "text",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "photo": {
      "field_name": "photo",
      "data_type": "string",
      "field_type": "image",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": "media/suppliers"
    },
    "address": {
      "field_name": "address",
      "data_type": "string",
      "field_type": "address",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "website": {
      "field_name": "website",
      "data_type": "string",
      "field_type": "URL",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    }
  },
  "ingredient": {
    "id": {
      "field_name": "id",
      "data_type": "string",
      "field_type": "slug",
      "cardinality": "",
      "relationship": "",
      "default": "title",
      "example": ""
    },
    "title": {
      "field_name": "title",
      "data_type": "string",
      "field_type": "text",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "image": {
      "field_name": "image",
      "data_type": "string",
      "field_type": "image",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": "media/ingredients"
    },
    "supplier": {
      "field_name": "supplier",
      "data_type": "string",
      "field_type": "type reference",
      "cardinality": "",
      "relationship": "Supplier",
      "default": "",
      "example": ""
    },
    "seasonal": {
      "field_name": "seasonal",
      "data_type": "boolean",
      "field_type": "boolean",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "in_season_price": {
      "field_name": "in_season_price",
      "data_type": "number",
      "field_type": "decimal",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "out_of_season_price": {
      "field_name": "out_of_season_price",
      "data_type": "number",
      "field_type": "decimal",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    }
  },
  "meal": {
    "id": {
      "field_name": "id",
      "data_type": "string",
      "field_type": "slug",
      "cardinality": "",
      "relationship": "",
      "default": "title",
      "example": ""
    },
    "title": {
      "field_name": "title",
      "data_type": "string",
      "field_type": "text",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "description": {
      "field_name": "description",
      "data_type": "string",
      "field_type": "text",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "bld": {
      "field_name": "bld",
      "data_type": "string",
      "field_type": "enum",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": "['breakfast', 'lunch', 'dinner', 'desert', 'snack']"
    },
    "photo": {
      "field_name": "photo",
      "data_type": "string",
      "field_type": "media",
      "cardinality": "3",
      "relationship": "",
      "default": "",
      "example": "media/calendar"
    },
    "internal_cost": {
      "field_name": "internal_cost",
      "data_type": "number",
      "field_type": "decimal",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "public_price": {
      "field_name": "public_price",
      "data_type": "number",
      "field_type": "decimal",
      "cardinality": "",
      "relationship": "",
      "default": "16",
      "example": ""
    },
    "ingredients": {
      "field_name": "ingredients",
      "data_type": "string",
      "field_type": "type reference",
      "cardinality": "unlimited",
      "relationship": "Ingredient",
      "default": "",
      "example": ""
    },
    "suppliers": {
      "field_name": "suppliers",
      "data_type": "string",
      "field_type": "type reference",
      "cardinality": "unlimited",
      "relationship": "Supplier",
      "default": "",
      "example": ""
    }
  },
  "plan": {
    "id": {
      "field_name": "id",
      "data_type": "string",
      "field_type": "slug",
      "cardinality": "1",
      "relationship": "",
      "default": "name",
      "example": ""
    },
    "name": {
      "field_name": "name",
      "data_type": "string",
      "field_type": "text",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "description": {
      "field_name": "description",
      "data_type": "string",
      "field_type": "textarea",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "meals": {
      "field_name": "meals",
      "data_type": "string",
      "field_type": "type reference",
      "cardinality": "unlimited",
      "relationship": "Meal",
      "default": "",
      "example": ""
    },
    "price": {
      "field_name": "price",
      "data_type": "number",
      "field_type": "price",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": "USD"
    },
    "date": {
      "field_name": "date",
      "data_type": "string",
      "field_type": "date",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    }
  },
  "order_item": {
    "id": {
      "field_name": "id",
      "data_type": "string",
      "field_type": "ID (auto increment)",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "date": {
      "field_name": "date",
      "data_type": "string",
      "field_type": "date",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "delivery_date": {
      "field_name": "delivery_date",
      "data_type": "string",
      "field_type": "date",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "meal": {
      "field_name": "meal",
      "data_type": "string",
      "field_type": "type reference",
      "cardinality": "1",
      "relationship": "Meal",
      "default": "",
      "example": ""
    },
    "meal_menu": {
      "field_name": "meal_menu",
      "data_type": "string",
      "field_type": "type reference",
      "cardinality": "1",
      "relationship": "Plan",
      "default": "",
      "example": ""
    },
    "servings": {
      "field_name": "servings",
      "data_type": "number",
      "field_type": "integer",
      "cardinality": "1",
      "relationship": "",
      "default": "1",
      "example": ""
    }
  },
  "order": {
    "id": {
      "field_name": "id",
      "data_type": "string",
      "field_type": "ID (auto increment)",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "customer": {
      "field_name": "customer",
      "data_type": "string",
      "field_type": "User (custom)",
      "cardinality": "1",
      "relationship": "Customer",
      "default": "",
      "example": ""
    },
    "created_date": {
      "field_name": "created_date",
      "data_type": "string",
      "field_type": "date",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "start_date": {
      "field_name": "start_date",
      "data_type": "string",
      "field_type": "date",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "final_price": {
      "field_name": "final_price",
      "data_type": "number",
      "field_type": "decimal",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "delivery_instructions": {
      "field_name": "delivery_instructions",
      "data_type": "string",
      "field_type": "textarea",
      "cardinality": "",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "customizations": {
      "field_name": "customizations",
      "data_type": "string",
      "field_type": "text",
      "cardinality": "1",
      "relationship": "",
      "default": "",
      "example": ""
    },
    "glass_containers": {
      "field_name": "glass_containers",
      "data_type": "boolean",
      "field_type": "boolean",
      "cardinality": "1",
      "relationship": "",
      "default": "0",
      "example": ""
    },
    "recurring": {
      "field_name": "recurring",
      "data_type": "boolean",
      "field_type": "boolean",
      "cardinality": "",
      "relationship": "",
      "default": "0",
      "example": ""
    },
    "order_items": {
      "field_name": "order_items",
      "data_type": "string",
      "field_type": "type reference",
      "cardinality": "unlimited",
      "relationship": "Order Item",
      "default": "",
      "example": ""
    },
    "status": {
      "field_name": "status",
      "data_type": "string",
      "field_type": "enum",
      "cardinality": "1",
      "relationship": "",
      "default": "unpaid",
      "example": "['paid', 'cancelled', 'unpaid']"
    }
  }
}
//---OBJECT-ACTIONS-TYPE-CONSTANTS-ENDS---//











































