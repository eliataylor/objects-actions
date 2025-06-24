"use client"

import { useState, type MouseEvent } from "react"
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Checkbox } from "@mui/material"
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material"
import Link from "next/link"
import { NAVITEMS, type ModelName, type ModelType, type NavItem } from "~/types/types"
import { useSelection } from "~/contexts/SelectionContext"

interface ActionsProps<T extends ModelName> {
  item: ModelType<T>
  onEdit?: () => void
  onDelete?: () => void
}

export const Actions = <T extends ModelName>({ 
  item, 
  onEdit, 
  onDelete 
}: ActionsProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const { toggleSelection, isSelected } = useSelection()
  const selected = isSelected(item)

  const navItem = NAVITEMS.find(ni => ni.type === item._type) as NavItem

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
      handleClose()
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
      handleClose()
    }
  }

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls={open ? "actions-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        color={selected ? "secondary" : "default"}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => {
          toggleSelection(item)
          handleClose()
        }}>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={selected}
              tabIndex={-1}
              disableRipple
              size="small"
            />
          </ListItemIcon>
          <ListItemText>Select for Comparison</ListItemText>
        </MenuItem>
        <Link 
          href={`/${navItem.segment}/${item.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
        </Link>
        {onEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
} 