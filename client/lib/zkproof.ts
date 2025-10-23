import { groth16 } from 'snarkjs';

export async function generateProof(input: {
  aadhaarHash: string;
  landOwnershipAcres: string;
  annualIncome: string;
  minLandRequired: string;
  maxIncomeLimit: string;
}) {
  // Generate proof in browser
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    '/circuits/KCCEligibility.wasm',
    '/circuits/KCCEligibility_final.zkey'
  );

  console.log("proof", proof);
  console.log("publicSignals", publicSignals);

  // ✅ CORRECTED: Format for Solidity
  const a = [proof.pi_a[0], proof.pi_a[1]];
  
  // ✅ FIX: Correct indexing - pi_b[0] and pi_b[1] are arrays, swap their elements
  const b = [
    [proof.pi_b[0][1], proof.pi_b[0][0]],  // Take array 0, swap elements
    [proof.pi_b[1][1], proof.pi_b[1][0]]   // Take array 1, swap elements
  ];
  
  const c = [proof.pi_c[0], proof.pi_c[1]];
  const input_signals = publicSignals;

  console.log("akproof values returnable", a, b, c, input_signals);

  return { a, b, c, input: input_signals };
}
