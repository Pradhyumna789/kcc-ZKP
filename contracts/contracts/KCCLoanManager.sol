// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IKCCVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) external view returns (bool);
}

contract KCCLoanManager {
    IKCCVerifier public verifier;
    
    enum LoanStatus { IN_PROGRESS, UNDER_REVIEW, SANCTIONED, REJECTED }
    
    struct LoanApplication {
        address farmer;
        uint256 requestedAmount;
        string loanCategory;
        LoanStatus status;
        uint256 sanctionedAmount;
        uint256 disbursedAmount;
        uint256 timestamp;
    }
    
    struct Credential {
        bool isIssued;
        bool isRevoked;
        uint256 issuedAt;
        address issuer;
    }
    
    mapping(address => Credential) public farmerCredentials;
    mapping(uint256 => LoanApplication) public loanApplications;
    mapping(address => uint256[]) public farmerLoans;
    
    uint256 public loanCounter;
    
    address public issuer;
    address public bankOfficer;
    address public auditor;
    
    event CredentialIssued(address indexed farmer, address indexed issuer, uint256 timestamp);
    event CredentialRevoked(address indexed farmer, uint256 timestamp);
    event LoanApplied(uint256 indexed loanId, address indexed farmer, uint256 amount);
    event LoanStatusUpdated(uint256 indexed loanId, LoanStatus status);
    event FundsDisbursed(uint256 indexed loanId, uint256 amount, string billHash);
    
    modifier onlyIssuer() {
        require(msg.sender == issuer, "Only issuer can perform this action");
        _;
    }
    
    modifier onlyBankOfficer() {
        require(msg.sender == bankOfficer, "Only bank officer can perform this action");
        _;
    }
    
    modifier onlyAuditor() {
        require(msg.sender == auditor, "Only auditor can perform this action");
        _;
    }
    
    constructor(address _verifierAddress) {
        verifier = IKCCVerifier(_verifierAddress);
        issuer = msg.sender;
    }
    
    function setBankOfficer(address _bankOfficer) external onlyIssuer {
        bankOfficer = _bankOfficer;
    }
    
    function setAuditor(address _auditor) external onlyIssuer {
        auditor = _auditor;
    }
    
    function issueCredential(address farmer) external onlyIssuer {
        require(!farmerCredentials[farmer].isIssued, "Credential already issued");
        
        farmerCredentials[farmer] = Credential({
            isIssued: true,
            isRevoked: false,
            issuedAt: block.timestamp,
            issuer: msg.sender
        });
        
        emit CredentialIssued(farmer, msg.sender, block.timestamp);
    }
    
    function revokeCredential(address farmer) external onlyIssuer {
        require(farmerCredentials[farmer].isIssued, "No credential issued");
        require(!farmerCredentials[farmer].isRevoked, "Already revoked");
        
        farmerCredentials[farmer].isRevoked = true;
        emit CredentialRevoked(farmer, block.timestamp);
    }
    
    function applyForLoan(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input,
        uint256 requestedAmount,
        string memory loanCategory
    ) external returns (uint256) {
        require(farmerCredentials[msg.sender].isIssued, "No credential issued");
        require(!farmerCredentials[msg.sender].isRevoked, "Credential revoked");
        
        require(verifier.verifyProof(a, b, c, input), "Invalid ZK proof");
        
        uint256 loanId = loanCounter++;
        
        loanApplications[loanId] = LoanApplication({
            farmer: msg.sender,
            requestedAmount: requestedAmount,
            loanCategory: loanCategory,
            status: LoanStatus.IN_PROGRESS,
            sanctionedAmount: 0,
            disbursedAmount: 0,
            timestamp: block.timestamp
        });
        
        farmerLoans[msg.sender].push(loanId);
        
        emit LoanApplied(loanId, msg.sender, requestedAmount);
        return loanId;
    }
    
    function reviewLoan(uint256 loanId) external onlyBankOfficer {
        require(loanApplications[loanId].status == LoanStatus.IN_PROGRESS, "Invalid status");
        
        loanApplications[loanId].status = LoanStatus.UNDER_REVIEW;
        emit LoanStatusUpdated(loanId, LoanStatus.UNDER_REVIEW);
    }
    
    function sanctionLoan(uint256 loanId, uint256 sanctionedAmount) external onlyBankOfficer {
        require(loanApplications[loanId].status == LoanStatus.UNDER_REVIEW, "Not under review");
        
        loanApplications[loanId].status = LoanStatus.SANCTIONED;
        loanApplications[loanId].sanctionedAmount = sanctionedAmount;
        
        emit LoanStatusUpdated(loanId, LoanStatus.SANCTIONED);
    }
    
    function rejectLoan(uint256 loanId) external onlyBankOfficer {
        loanApplications[loanId].status = LoanStatus.REJECTED;
        emit LoanStatusUpdated(loanId, LoanStatus.REJECTED);
    }
    
    function disburseFunds(uint256 loanId, uint256 amount, string memory billHash) external onlyAuditor {
        LoanApplication storage loan = loanApplications[loanId];
        require(loan.status == LoanStatus.SANCTIONED, "Loan not sanctioned");
        require(loan.disbursedAmount + amount <= loan.sanctionedAmount, "Exceeds sanctioned amount");
        
        loan.disbursedAmount += amount;
        emit FundsDisbursed(loanId, amount, billHash);
    }
    
    function getFarmerLoans(address farmer) external view returns (uint256[] memory) {
        return farmerLoans[farmer];
    }
}
