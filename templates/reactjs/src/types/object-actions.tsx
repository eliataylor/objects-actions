// TODO: generate NavItems
interface NavItem {
    name: string;
    path: string;
}

export const NAVITEMS: NavItem[] = []


// TODO: generate API response structures
export interface ListView {
    meta: object;
    data: Array<Supplier | Ingredient>
}

export interface EntityView {
    meta: object;
    data: Supplier | Ingredient;
}

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



