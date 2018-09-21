pragma solidity 0.4.24;
import "./Remittance.sol";

contract RemittanceFactory {
    address[] public deployedRemittances;
    uint limitDeadline;
    
    constructor (uint _limitDeadline) public {
        limitDeadline = _limitDeadline;
    }

    function createRemittance(address _transferRecipient, bytes32 _hashedPassword1, bytes32 _hashedPassword2, uint _secToDeadline) public payable {
        require(limitDeadline > _secToDeadline, "Deadline beyond limit");
        address owner = msg.sender;
        address newRemittance = (new Remittance).value(address(this).balance)(owner, _transferRecipient, _hashedPassword1, _hashedPassword2, _secToDeadline);
        deployedRemittances.push(newRemittance);
    }

    function getDeployedRemittances() public view returns (address[]) {
        return deployedRemittances;
    }
}