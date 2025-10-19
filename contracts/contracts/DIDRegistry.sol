// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract DIDRegistry {
    
    enum Role { NONE, FARMER, ISSUER, BANK, AUDITOR }
    
    struct DIDDocument {
        string didIdentifier;
        address ethAddress;
        Role role;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    mapping(address => DIDDocument) public dids;
    mapping(string => address) public didToAddress;
    
    event DIDCreated(
        string indexed didIdentifier, 
        address indexed ethAddress, 
        Role role
    );
    
    event DIDDeactivated(string indexed didIdentifier);
    
    event RoleUpdated(
        string indexed didIdentifier, 
        Role oldRole, 
        Role newRole
    );
    
    modifier onlyActiveDID() {
        require(dids[msg.sender].isActive, "DID not active");
        _;
    }
    
    modifier didNotExists(string memory _didIdentifier) {
        require(
            didToAddress[_didIdentifier] == address(0), 
            "DID already exists"
        );
        _;
    }
    
    function createDID(
        string memory _didIdentifier, 
        Role _role
    ) public didNotExists(_didIdentifier) {
        require(_role != Role.NONE, "Invalid role");
        
        DIDDocument memory newDID = DIDDocument({
            didIdentifier: _didIdentifier,
            ethAddress: msg.sender,
            role: _role,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        dids[msg.sender] = newDID;
        didToAddress[_didIdentifier] = msg.sender;
        
        emit DIDCreated(_didIdentifier, msg.sender, _role);
    }
    
    function deactivateDID() public onlyActiveDID {
        dids[msg.sender].isActive = false;
        dids[msg.sender].updatedAt = block.timestamp;
        
        emit DIDDeactivated(dids[msg.sender].didIdentifier);
    }
    
    function getDID(address _address) public view returns (DIDDocument memory) {
        return dids[_address];
    }
    
    function resolveDID(string memory _didIdentifier) public view returns (address) {
        return didToAddress[_didIdentifier];
    }
    
    function isActiveRole(address _address, Role _role) public view returns (bool) {
        DIDDocument memory did = dids[_address];
        return did.isActive && did.role == _role;
    }
}
