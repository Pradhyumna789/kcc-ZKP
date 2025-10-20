#!/bin/bash

CIRCUIT_NAME="KCCEligibility"
BUILD_DIR="build"
KEYS_DIR="keys"
PTAU_FILE="powersOfTau28_hez_final_14.ptau"

mkdir -p $KEYS_DIR

# Download Powers of Tau from alternative source (Google Cloud Storage)
if [ ! -f "$KEYS_DIR/$PTAU_FILE" ]; then
    echo "📥 Downloading Powers of Tau ceremony file from Google Cloud..."
    wget https://storage.googleapis.com/zkevm/ptau/${PTAU_FILE} -O $KEYS_DIR/$PTAU_FILE
    
    # If that fails, try smaller file for testing
    if [ $? -ne 0 ]; then
        echo "⚠️  Large file failed, trying smaller Powers of Tau (size 12)..."
        PTAU_FILE="powersOfTau28_hez_final_12.ptau"
        wget https://storage.googleapis.com/zkevm/ptau/${PTAU_FILE} -O $KEYS_DIR/$PTAU_FILE
    fi
fi

# Verify file is not empty
if [ ! -s "$KEYS_DIR/$PTAU_FILE" ]; then
    echo "❌ Powers of Tau file is empty or corrupted. Removing..."
    rm "$KEYS_DIR/$PTAU_FILE"
    exit 1
fi

echo "✅ Powers of Tau file downloaded successfully"
echo "File size: $(du -h $KEYS_DIR/$PTAU_FILE | cut -f1)"

echo ""
echo "🔧 Starting Groth16 trusted setup..."

# Phase 2 - Circuit specific setup
snarkjs groth16 setup \
  $BUILD_DIR/${CIRCUIT_NAME}.r1cs \
  $KEYS_DIR/$PTAU_FILE \
  $KEYS_DIR/${CIRCUIT_NAME}_0000.zkey

if [ $? -ne 0 ]; then
    echo "❌ Setup failed. Check if circuit was compiled correctly."
    exit 1
fi

echo ""
echo "🎲 Contributing to Phase 2 ceremony..."
snarkjs zkey contribute \
  $KEYS_DIR/${CIRCUIT_NAME}_0000.zkey \
  $KEYS_DIR/${CIRCUIT_NAME}_final.zkey \
  --name="First Contributor" \
  -v

if [ $? -ne 0 ]; then
    echo "❌ Contribution failed."
    exit 1
fi

echo ""
echo "📄 Exporting verification key..."
snarkjs zkey export verificationkey \
  $KEYS_DIR/${CIRCUIT_NAME}_final.zkey \
  $KEYS_DIR/verification_key.json

if [ $? -ne 0 ]; then
    echo "❌ Verification key export failed."
    exit 1
fi

echo ""
echo "✅ Trusted setup completed successfully!"
echo "Generated files:"
echo "  - $KEYS_DIR/${CIRCUIT_NAME}_final.zkey (proving key)"
echo "  - $KEYS_DIR/verification_key.json"
