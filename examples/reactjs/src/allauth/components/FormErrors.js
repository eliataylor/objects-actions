import { Typography } from '@mui/material'

export function hasError (errors: any, param: string): boolean {
  if (!errors || !Array.isArray(errors)) return false
  const has = errors.find(error => error.param && error.param === param)
  return has ? true : false
}

export default function FormErrors (props) {
  if (!props.errors || !props.errors.length) {
    return null
  }
  const errors = props.errors.filter(error => (props.param ? error.param === props.param : error.param == null))
  return (
    <div style={{ color: 'darkred' }}>{errors.map((e, i) => <Typography
      color="error"
      variant="subtitle1"
      key={i}
    >{e.message}
    </Typography>)}
    </div>
  )
}
