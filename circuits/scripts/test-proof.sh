#!/bin/bash

CIRCUIT_NAME="KCCEligibility"
BUILD_DIR="build"
KEYS_DIR="keys"

echo "🧪 Testing proof generation..."

# Create sample input
cat > input.json << EOF
{
  "aadhaarHash": "123456789012",
  "landOwnershipAcres": "5",
  "annualIncome": "200000",
  "minLandRequired": "3",
  "maxIncomeLimit": "300000"
}
EOF

echo "📝 Generating witness..."
node $BUILD_DIR/${CIRCUIT_NAME}_js/generate_witness.js \
  $BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm \
  input.json \
  witness.wtns

echo "🔐 Generating proof..."
snarkjs groth16 prove \
  $KEYS_DIR/${CIRCUIT_NAME}_final.zkey \
  witness.wtns \
  proof.json \
  public.json

echo "✅ Verifying proof..."
snarkjs groth16 verify \
  $KEYS_DIR/verification_key.json \
  public.json \
  proof.json

echo "🎉 Test complete!"
