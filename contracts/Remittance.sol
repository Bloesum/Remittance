pragma solidity 0.4.24;

contract Remittance {
    
    address public owner;
    address public transferRecipient;
    bytes32 public hashedPassword1;
    bytes32 public hashedPassword2;
    uint amount;
    uint deadline;
    uint daysToDeadline;
    
    event logContractCreated(address indexed _transferRecipient,bytes32 indexed _hashedPassword1, bytes32 indexed _hashedPassword2);
    event logWithdrawFunds(address indexed _transferRecipient, uint indexed _amount);
    event logReclaimFunds(address indexed _owner, uint indexed _amount, uint _now);
    
    constructor (address _transferRecipient, bytes32 _hashedPassword1, bytes32 _hashedPassword2, uint _daysToDeadline) public payable {
            
        transferRecipient = _transferRecipient;
        hashedPassword1 = _hashedPassword1; // TODO: initial password are being hashed offchain
        hashedPassword2 = _hashedPassword2;
        amount = msg.value;
        owner = msg.sender;
        deadline = now + (_daysToDeadline * 86400); //TODO: Max to deadline needs to be set in Factory
        emit logContractCreated(transferRecipient, hashedPassword1, hashedPassword2);
    }
    
    modifier onlyTransferRecipient () {
        require(transferRecipient == msg.sender);
        _;
    }
    
    modifier onlyOwner () {
        require(owner == msg.sender);
        _;
    }
    
    function withdrawFunds(string password1, string password2) public onlyTransferRecipient {
        require(hashedPassword1 == keccak256(abi.encodePacked(password1)));
        require(hashedPassword2 == keccak256(abi.encodePacked(password2)));
        require(amount > 0, "Funds have already been reclaimed");
        emit logWithdrawFunds(msg.sender, amount);
        msg.sender.transfer(amount);
    }
    
    function reclaimFund() public onlyOwner {
        require(deadline < now, "Deadline for refund has not been passed");
        emit logReclaimFunds(msg.sender, amount, now);
        msg.sender.transfer(amount);
        amount = 0;
    }
    
    function kill() public { //TODO: move to Factory
        if (msg.sender == owner) selfdestruct(owner);
    }
}