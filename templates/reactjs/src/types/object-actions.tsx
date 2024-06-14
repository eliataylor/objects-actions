interface NavItem {
    name: string;
    path: string;
}

export const NAVITEMS:NavItem[] = []

export interface ListView {
    meta: object;
    data: object[];
}

export interface EntityView {
    meta: object;
    data: object;
}

// TODO: generate NavItems


// TODO: generate Object Types

export interface Meal {
    id: number;
    title: string;
    bld: string;
    description: string;
    price: number;
    photos: string[]; // Assuming photo URLs will be stored as strings
    servings?: number; // only a CLIENT SIDE ObjectActions of this meal in my cart
    date?: string;
}

export interface Day {
    day: string;
    date: string;
    delivered: string;
    meals: Meal[];
}

export interface Week {
    week_name: string;
    date: string;
    days: Day[]
}
export type MenuData = Week[] | null;
export type OrderItems = Meal[];

export interface Program {
    program_name: string;
    meals: string[];
    servings: number;
    meal_count: number;
    start_date: string;
    use_glass: boolean;
}


// TODO: generate Object Types defaults
export const defaultProgram: Program = {
    program_name: 'Meal Prep',
    meals: ['lunch', 'dinner'],
    servings: 1,
    meal_count: 0,
    start_date: new Date().toString(),
    use_glass: false
}