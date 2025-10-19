// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./DIDRegistry.sol";

contract VCRegistry {
    
    DIDRegistry public didRegistry;
    
    struct VerifiableCredential {
        bytes32 credentialHash;
        string issuerDID;
        string holderDID;
        uint256 issuedAt;
        uint256 expiresAt;
        bool isRevoked;
    }
    
    mapping(bytes32 => VerifiableCredential) public credentials;
    mapping(string => bytes32[]) public holderCredentials;
    
    event CredentialIssued(
        bytes32 indexed credentialId,
        string indexed issuerDID,
        string indexed holderDID,
        uint256 issuedAt
    );
    
    event CredentialRevoked(
        bytes32 indexed credentialId,
        string indexed issuerDID
    );
    
    constructor(address _didRegistryAddress) {
        didRegistry = DIDRegistry(_didRegistryAddress);
    }
    
    modifier onlyIssuer() {
        require(
            didRegistry.isActiveRole(msg.sender, DIDRegistry.Role.ISSUER),
            "Only active issuers can issue credentials"
        );
        _;
    }
    
    modifier credentialExists(bytes32 _credentialId) {
        require(
            credentials[_credentialId].issuedAt != 0,
            "Credential does not exist"
        );
        _;
    }
    
    function issueCredential(
        bytes32 _credentialHash,
        string memory _issuerDID,
        string memory _holderDID,
        uint256 _validityPeriod
    ) public onlyIssuer returns (bytes32) {
        bytes32 credentialId = keccak256(
            abi.encodePacked(_credentialHash, _issuerDID, _holderDID, block.timestamp)
        );
        
        require(
            credentials[credentialId].issuedAt == 0,
            "Credential already exists"
        );
        
        uint256 expiresAt = _validityPeriod > 0 
            ? block.timestamp + _validityPeriod 
            : 0;
        
        VerifiableCredential memory newVC = VerifiableCredential({
            credentialHash: _credentialHash,
            issuerDID: _issuerDID,
            holderDID: _holderDID,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            isRevoked: false
        });
        
        credentials[credentialId] = newVC;
        holderCredentials[_holderDID].push(credentialId);
        
        emit CredentialIssued(credentialId, _issuerDID, _holderDID, block.timestamp);
        
        return credentialId;
    }
    
    function revokeCredential(
        bytes32 _credentialId
    ) public onlyIssuer credentialExists(_credentialId) {
        VerifiableCredential storage vc = credentials[_credentialId];
        
        address issuerAddress = didRegistry.resolveDID(vc.issuerDID);
        require(msg.sender == issuerAddress, "Only issuer can revoke");
        
        require(!vc.isRevoked, "Credential already revoked");
        
        vc.isRevoked = true;
        
        emit CredentialRevoked(_credentialId, vc.issuerDID);
    }
    
    function verifyCredential(
        bytes32 _credentialId
    ) public view credentialExists(_credentialId) returns (bool) {
        VerifiableCredential memory vc = credentials[_credentialId];
        
        if (vc.isRevoked) return false;
        
        if (vc.expiresAt > 0 && block.timestamp > vc.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    function getHolderCredentials(
        string memory _holderDID
    ) public view returns (bytes32[] memory) {
        return holderCredentials[_holderDID];
    }
    
    function getCredential(
        bytes32 _credentialId
    ) public view returns (VerifiableCredential memory) {
        return credentials[_credentialId];
    }
}
