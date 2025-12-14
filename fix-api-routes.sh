#!/bin/bash

# Fix all API routes to properly initialize supabase client

files=(
  "src/app/api/sweets/[id]/route.ts"
  "src/app/api/sweets/[id]/purchase/route.ts"
  "src/app/api/sweets/[id]/restock/route.ts"
  "src/app/api/sweets/search/route.ts"
  "src/app/api/categories/route.ts"
  "src/app/api/purchases/route.ts"
  "src/app/api/auth/user/register/route.ts"
  "src/app/api/auth/user/login/route.ts"
  "src/app/api/auth/admin/setup/route.ts"
  "src/app/api/auth/admin/login/route.ts"
)

for file in "${files[@]}"; do
  # Add supabase initialization after try { line
  sed -i 's/  try {/  try {\n    const supabase = await createAdminClient();/g' "$file"
done

echo "Fixed all API routes"
