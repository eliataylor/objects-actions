

//---OBJECT-ACTIONS-SCHEMA-STARTS---//
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
//---OBJECT-ACTIONS-SCHEMA-ENDS---//



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







