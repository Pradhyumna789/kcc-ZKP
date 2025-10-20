#!/bin/bash

CIRCUIT_NAME="KCCEligibility"
SRC_DIR="src"
BUILD_DIR="build"

mkdir -p $BUILD_DIR

echo "Compiling $CIRCUIT_NAME circuit..."
circom $SRC_DIR/${CIRCUIT_NAME}.circom \
  --r1cs \
  --wasm \
  --sym \
  -o $BUILD_DIR

echo "✅ Circuit compiled successfully!"
echo "Generated files:"
echo "  - $BUILD_DIR/${CIRCUIT_NAME}.r1cs"
echo "  - $BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm"
echo "  - $BUILD_DIR/${CIRCUIT_NAME}.sym"
