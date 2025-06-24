import { type ModelName, type ModelType, type FieldTypeDefinition, getNavItem, type RelEntity } from "~/types/types"
import { Chip, Link as MuiLink } from "@mui/material"
import Link from "next/link"
import { Fragment } from "react"

interface FieldValueProps {
  value: unknown
  fieldDef: FieldTypeDefinition
  type: ModelName
}

export function FieldValue({ value, fieldDef, type }: FieldValueProps) {
  if (value === undefined || value === null) {
    return <span className="text-gray-400">-</span>
  }
    console.log(fieldDef, value)
  switch (fieldDef.field_type) {
    case "enum":
      const option = fieldDef.options?.find(opt => opt.id === value)
      return <Chip label={option?.label ?? String(value)} size="small" variant="outlined" />

    case "type_reference":
      if (Array.isArray(value)) {
        return <Fragment>{value.map(v => <FieldValue key={v.id} value={v} fieldDef={fieldDef} type={v._type} />)}</Fragment>
      } else {
        const relValue = value as RelEntity
        const navItem = getNavItem(relValue._type)
        return (
          <Link 
            href={`/${navItem?.segment}/${relValue.id}`}
            passHref
          >
            <MuiLink>{relValue.str}</MuiLink>
          </Link>
        )  
      }

    case "date":
      return <Fragment>{new Date(value as string).toLocaleDateString()}</Fragment>

    case "json":
      return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>

    case "textarea":
      return <div className="whitespace-pre-wrap">{String(value)}</div>

    case "percentage":
      return <Fragment>{value}%</Fragment>

    case "integer":
    case "text":
    case "phone":
    case "slug":
    default:
      return <Fragment>{String(value)}</Fragment>
  }
} 