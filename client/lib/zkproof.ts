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

  // Format for Solidity
  const a = [proof.pi_a[0], proof.pi_a[1]];
  const b = [
    [proof.pi_b[0][1][0], proof.pi_b[0][1][1]],
    [proof.pi_b[0][0][0], proof.pi_b[0][0][1]]
  ];
  const c = [proof.pi_c[0], proof.pi_c[1]];
  const input_signals = publicSignals;

  return { a, b, c, input: input_signals };
}
