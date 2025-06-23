"use client"

import { useParams } from "next/navigation"
import { useSelection } from "~/contexts/SelectionContext"
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Box,
  Button,
  Link
} from "@mui/material"
import { type ModelName, type ModelType, TypeFieldSchema, type FieldTypeDefinition, getNavItem } from "~/types/types"
import { useRouter } from "next/navigation"
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material"
import { FieldValue } from "~/app/_components/FieldValue"
import { GradientButton } from "~/app/_components/Button"

const defaultFieldDef: FieldTypeDefinition = {
  machine: "",
  singular: "",
  plural: "",
  field_type: "text",
  data_type: "string",
  cardinality: 1,
  required: false,
  default: "",
  example: ""
}

export default function ComparePage() {
  const params = useParams()
  const router = useRouter()
  const type = params.type as string
  const { getItemsByType, clearSelections } = useSelection()
  
  const items = getItemsByType(type)

  if (items.length < 2) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Please select at least 2 items to compare
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </Box>
    )
  }

  const navItem = getNavItem(items[0]._type)
  const typeSchema = TypeFieldSchema[navItem?.type as ModelName] || {}
  

  // Get all unique field names from all items
  const fields = Array.from(
    new Set(
      items.flatMap(item => 
        Object.keys(item).filter(key => 
          key !== '_type' && key !== 'id'
        )
      )
    )
  ).sort()

  const handleClearAndGoBack = () => {
    clearSelections()
    router.back()
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Comparing {navItem?.plural}
          </Typography>
        </Box>
        <Box>
          <Button 
            onClick={() => router.back()}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button variant="outlined" 
            size="small" 
            onClick={handleClearAndGoBack}
          >
            Clear Selections
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
              {items.map((item, index) => (
                <TableCell key={item.id} sx={{ fontWeight: 'bold' }}>
                  <Link href={`/${navItem?.segment}/${item.id}`} passHref>
                    {item.name ??  `Drug ${index + 1}`}
                  </Link>
                </TableCell>

              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map(field => (
              <TableRow key={field}>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                  {typeSchema[field]?.singular || field}
                </TableCell>
                {items.map(item => (
                  <TableCell key={`${item.id}-${field}`}>
                    <FieldValue
                      value={item[field as keyof typeof item]}
                      fieldDef={typeSchema[field] || { ...defaultFieldDef, machine: field, singular: field, plural: `${field}s` }}
                      type={type.toUpperCase() as ModelName}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
} 