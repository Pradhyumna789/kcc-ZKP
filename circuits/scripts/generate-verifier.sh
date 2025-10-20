#!/bin/bash

CIRCUIT_NAME="KCCEligibility"
KEYS_DIR="keys"
OUTPUT_DIR="../contracts/contracts"

mkdir -p $OUTPUT_DIR

echo "🔨 Generating Solidity verifier contract..."

snarkjs zkey export solidityverifier \
  $KEYS_DIR/${CIRCUIT_NAME}_final.zkey \
  $OUTPUT_DIR/KCCVerifier.sol

echo "✅ Solidity verifier generated!"
echo "Contract location: $OUTPUT_DIR/KCCVerifier.sol"
