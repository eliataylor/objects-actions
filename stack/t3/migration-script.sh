#!/bin/bash

# Migration script to replace react-router-dom with Next.js navigation

echo "Starting migration from react-router-dom to Next.js navigation..."

# Replace import statements
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/import { Link } from "react-router-dom"/import Link from "next\/link"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/import { useNavigate } from "react-router-dom"/import { useRouter } from "next\/navigation"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/import { Link, useNavigate } from "react-router-dom"/import Link from "next\/link";\nimport { useRouter } from "next\/navigation"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/import { useNavigate, Link } from "react-router-dom"/import Link from "next\/link";\nimport { useRouter } from "next\/navigation"/g'

# Replace hook usage
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/const navigate = useNavigate()/const router = useRouter()/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/navigate(/router.push(/g'

# Replace Link props
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/<Link to=/<Link href=/g'

echo "Migration complete!"
echo "Please check the following files for any remaining issues:"
grep -r "react-router-dom" src/ || echo "No remaining react-router-dom imports found." 