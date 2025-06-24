import { type ModelType, type ModelName } from "~/types/types";

export type PermissionAction = "view" | "add" | "edit" | "delete";

// Mock session data type
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Mock session data - replace with real auth when allauth is integrated
function getMockUser(): MockUser {
  return {
    id: "mock-user-1",
    name: "Mock User",
    email: "mock@example.com",
    role: "admin" // Change to "user" to test different permission levels
  };
}

export function canDo(
  action: PermissionAction,
  entity: ModelType<ModelName>,
  user?: MockUser // Use mock user if not provided
): boolean | string {
  // Use mock user if no user provided
  const currentUser = user || getMockUser();

  // Admin users can do everything
  if (currentUser.role === "admin") {
    return true;
  }

  // Default permission logic - customize based on your needs
  switch (action) {
    case "view":
      return true; // Most entities are viewable by authenticated users
    
    case "add":
      return currentUser.role === "admin" || currentUser.role === "editor" 
        ? true 
        : "Insufficient permissions to add items";
    
    case "edit":
      // Users can edit their own content, admins can edit anything
      if (currentUser.role === "admin" || currentUser.role === "editor") {
        return true;
      }
      // Check if user owns the entity (if it has a user_id or created_by field)
      const ownedEntity = entity as any;
      if (ownedEntity.user_id === currentUser.id || ownedEntity.created_by === currentUser.id) {
        return true;
      }
      return "You can only edit your own content";
    
    case "delete":
      // Only admins can delete by default
      return currentUser.role === "admin" 
        ? true 
        : "Only administrators can delete items";
    
    default:
      return "Unknown action";
  }
}

export function canViewEntity(
  entity: ModelType<ModelName>,
  user?: MockUser
): boolean {
  const result = canDo("view", entity, user);
  return typeof result === "boolean" ? result : false;
}

export function canAddEntity(
  entityType: ModelName,
  user?: MockUser
): boolean {
  // Create a mock entity for permission checking
  const mockEntity = { id: "new", _type: entityType } as ModelType<ModelName>;
  const result = canDo("add", mockEntity, user);
  return typeof result === "boolean" ? result : false;
} 