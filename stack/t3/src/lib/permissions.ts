import { type Session } from "next-auth";
import { type ModelType, type ModelName } from "~/types/types";

export type PermissionAction = "view" | "add" | "edit" | "delete";

export function canDo(
  action: PermissionAction,
  entity: ModelType<ModelName>,
  user: Session["user"] | null | undefined
): boolean | string {
  // If no user, only allow public actions
  if (!user) {
    return action === "view" ? true : "Authentication required";
  }

  // Admin users can do everything
  if (user.role === "admin") {
    return true;
  }

  // Default permission logic - customize based on your needs
  switch (action) {
    case "view":
      return true; // Most entities are viewable by authenticated users
    
    case "add":
      return user.role === "admin" || user.role === "editor" 
        ? true 
        : "Insufficient permissions to add items";
    
    case "edit":
      // Users can edit their own content, admins can edit anything
      if (user.role === "admin" || user.role === "editor") {
        return true;
      }
      // Check if user owns the entity (if it has a user_id or created_by field)
      const ownedEntity = entity as any;
      if (ownedEntity.user_id === user.id || ownedEntity.created_by === user.id) {
        return true;
      }
      return "You can only edit your own content";
    
    case "delete":
      // Only admins can delete by default
      return user.role === "admin" 
        ? true 
        : "Only administrators can delete items";
    
    default:
      return "Unknown action";
  }
}

export function canViewEntity(
  entity: ModelType<ModelName>,
  user: Session["user"] | null | undefined
): boolean {
  const result = canDo("view", entity, user);
  return typeof result === "boolean" ? result : false;
}

export function canAddEntity(
  entityType: ModelName,
  user: Session["user"] | null | undefined
): boolean {
  // Create a mock entity for permission checking
  const mockEntity = { id: "new", _type: entityType } as ModelType<ModelName>;
  const result = canDo("add", mockEntity, user);
  return typeof result === "boolean" ? result : false;
} 