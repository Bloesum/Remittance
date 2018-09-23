pragma solidity 0.4.24;

contract Remittance {
    
    address public transferRecipient;
    bytes32 public hashedPassword1;
    bytes32 public hashedPassword2;
    address public owner;
    uint public amount;
    uint deadline;
    
    event logContractCreated(address indexed _transferRecipient,bytes32 indexed _hashedPassword1, bytes32 indexed _hashedPassword2);
    event logWithdrawFunds(address indexed _transferRecipient, uint indexed _amount);
    event logReclaimFunds(address indexed _owner, uint indexed _amount, uint _now);
    
    constructor (address _owner, address _transferRecipient, bytes32 _hashedPassword1, bytes32 _hashedPassword2, uint _secToDeadline) public payable {
        require(_transferRecipient != address(0));
        require(_hashedPassword1[0] != 0);
        require(_hashedPassword2[0] != 0);
        require(_secToDeadline > 0);
        transferRecipient = _transferRecipient;
        hashedPassword1 = _hashedPassword1; // NB: initial passwords are being hashed offchain
        hashedPassword2 = _hashedPassword2;
        amount = msg.value;
        owner = _owner;
        deadline = now + _secToDeadline;
        emit logContractCreated(transferRecipient, hashedPassword1, hashedPassword2);
    }
    
    modifier onlyOwner () {
        require(owner == msg.sender);
        _;
    }
    
    function withdrawFunds(string password1, string password2) public {
        require(hashedPassword1 == keccak256(abi.encodePacked(password1)));
        require(hashedPassword2 == keccak256(abi.encodePacked(password2)));
        require(amount > 0, "Funds have already been reclaimed");
        emit logWithdrawFunds(msg.sender, amount);
        uint sendAmount = amount;
        amount = 0;
        transferRecipient.transfer(sendAmount);
    }
    
    function reclaimFunds() public onlyOwner {
        require(deadline < now, "Deadline for refund has not been passed");
        require(amount > 0, "Fund already withdrawn");
        emit logReclaimFunds(msg.sender, amount, now);
        uint sendAmount = amount;
        amount = 0;
        msg.sender.transfer(sendAmount);
    }
    
    function kill() public { //TODO: move to Factory?
        require(msg.sender == owner);
        selfdestruct(owner);
    }
}