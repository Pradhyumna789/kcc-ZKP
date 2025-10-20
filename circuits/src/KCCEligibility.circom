pragma circom 2.0.0;

template KCCEligibility() {
    // Private inputs (never revealed)
    signal input aadhaarHash;
    signal input landOwnershipAcres;
    signal input annualIncome;
    
    // Public inputs (revealed for verification)
    signal input minLandRequired;
    signal input maxIncomeLimit;
    
    // Output
    signal output isEligible;
    
    // Intermediate signals
    signal landCheck;
    signal incomeCheck;
    
    // Land check: landOwnership >= minLandRequired
    component landComparator = GreaterEqThan(32);
    landComparator.in[0] <== landOwnershipAcres;
    landComparator.in[1] <== minLandRequired;
    landCheck <== landComparator.out;
    
    // Income check: annualIncome <= maxIncomeLimit
    component incomeComparator = LessEqThan(32);
    incomeComparator.in[0] <== annualIncome;
    incomeComparator.in[1] <== maxIncomeLimit;
    incomeCheck <== incomeComparator.out;
    
    // Both conditions must be true
    isEligible <== landCheck * incomeCheck;
}

// Comparator templates
template GreaterEqThan(n) {
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n);
    lt.in[0] <== in[0];
    lt.in[1] <== in[1];
    out <== 1 - lt.out;
}

template LessEqThan(n) {
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n);
    lt.in[0] <== in[1];
    lt.in[1] <== in[0];
    out <== 1 - lt.out;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component n2b = Num2Bits(n+1);
    n2b.in <== in[0] + (1<<n) - in[1];
    
    out <== 1-n2b.out[n];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }

    lc1 === in;
}

component main {public [minLandRequired, maxIncomeLimit]} = KCCEligibility();
