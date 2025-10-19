// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./DIDRegistry.sol";
import "./VCRegistry.sol";

contract LoanApplication {
    
    DIDRegistry public didRegistry;
    VCRegistry public vcRegistry;
    
    enum ApplicationState { 
        NONE,
        IN_PROGRESS, 
        UNDER_REVIEW, 
        SANCTIONED, 
        REJECTED,
        DISBURSED
    }
    
    struct Loan {
        uint256 loanId;
        string farmerDID;
        string bankDID;
        uint256 requestedAmount;
        uint256 sanctionedAmount;
        ApplicationState state;
        bytes32 eligibilityProofHash;
        uint256 appliedAt;
        uint256 sanctionedAt;
    }
    
    struct FarmerWallet {
        uint256 lockedBalance;
        uint256 availableBalance;
        uint256 totalDisbursed;
    }
    
    mapping(uint256 => Loan) public loans;
    mapping(string => FarmerWallet) public farmerWallets;
    mapping(string => uint256[]) public farmerLoans;
    
    uint256 public loanCounter;
    
    event LoanApplicationCreated(
        uint256 indexed loanId,
        string indexed farmerDID,
        string indexed bankDID,
        uint256 amount
    );
    
    event LoanSanctioned(uint256 indexed loanId, uint256 sanctionedAmount);
    event LoanRejected(uint256 indexed loanId, string reason);
    
    constructor(address _didRegistryAddress, address _vcRegistryAddress) {
        didRegistry = DIDRegistry(_didRegistryAddress);
        vcRegistry = VCRegistry(_vcRegistryAddress);
        loanCounter = 0;
    }
    
    modifier onlyFarmer() {
        require(
            didRegistry.isActiveRole(msg.sender, DIDRegistry.Role.FARMER),
            "Only farmers can apply"
        );
        _;
    }
    
    modifier onlyBank() {
        require(
            didRegistry.isActiveRole(msg.sender, DIDRegistry.Role.BANK),
            "Only banks can perform this action"
        );
        _;
    }
    
    function applyForLoan(
        string memory _farmerDID,
        string memory _bankDID,
        uint256 _requestedAmount,
        bytes32 _eligibilityProofHash
    ) public onlyFarmer returns (uint256) {
        require(_requestedAmount > 0, "Invalid amount");
        
        loanCounter++;
        
        Loan memory newLoan = Loan({
            loanId: loanCounter,
            farmerDID: _farmerDID,
            bankDID: _bankDID,
            requestedAmount: _requestedAmount,
            sanctionedAmount: 0,
            state: ApplicationState.IN_PROGRESS,
            eligibilityProofHash: _eligibilityProofHash,
            appliedAt: block.timestamp,
            sanctionedAt: 0
        });
        
        loans[loanCounter] = newLoan;
        farmerLoans[_farmerDID].push(loanCounter);
        
        emit LoanApplicationCreated(loanCounter, _farmerDID, _bankDID, _requestedAmount);
        
        return loanCounter;
    }
    
    function sanctionLoan(uint256 _loanId, uint256 _sanctionedAmount) public onlyBank {
        Loan storage loan = loans[_loanId];
        
        require(loan.state == ApplicationState.IN_PROGRESS, "Invalid loan state");
        require(_sanctionedAmount > 0, "Invalid amount");
        require(_sanctionedAmount <= loan.requestedAmount, "Cannot sanction more than requested");
        
        loan.sanctionedAmount = _sanctionedAmount;
        loan.state = ApplicationState.SANCTIONED;
        loan.sanctionedAt = block.timestamp;
        
        farmerWallets[loan.farmerDID].lockedBalance += _sanctionedAmount;
        
        emit LoanSanctioned(_loanId, _sanctionedAmount);
    }
    
    function rejectLoan(uint256 _loanId, string memory _reason) public onlyBank {
        Loan storage loan = loans[_loanId];
        require(loan.state == ApplicationState.IN_PROGRESS, "Invalid loan state");
        
        loan.state = ApplicationState.REJECTED;
        emit LoanRejected(_loanId, _reason);
    }
    
    function getLoan(uint256 _loanId) public view returns (Loan memory) {
        return loans[_loanId];
    }
    
    function getFarmerLoans(string memory _farmerDID) public view returns (uint256[] memory) {
        return farmerLoans[_farmerDID];
    }
    
    function getFarmerWallet(string memory _farmerDID) public view returns (FarmerWallet memory) {
        return farmerWallets[_farmerDID];
    }
}
