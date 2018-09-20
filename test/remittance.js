let Remittance = artifacts.require("../contracts/Remittance.sol");

Promise = require("bluebird");
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract('Testing Remittance', function(accounts) {

  let remittance;
  let owner = accounts[0];
  let account_one = accounts[1];
  let password1 = "test1";
  let password2 = "test2";
  let hashedPassword1 = "x06d255fc3390ee6b41191da315958b7d6a1e5b17904cc7683558f98acc57977b4";
  let hashedPassword2 = "x04da432f1ecd4c0ac028ebde3a3f78510a21d54087b161590a63080d33b702b8d";
  let sendAmount = 10;
  let daysToDeadline = 2;

  before(function () {
  return Remittance.new(account_one, hashedPassword1, hashedPassword2, daysToDeadline, {value: sendAmount})
    .then(function (_instance) {
      remittance = _instance;
    });
  });

  it("creates a contract", function() {
    return web3.eth.getBalancePromise(remittance.address) 
      .then(function(balance) {
      assert.equal(10, balance, "No initial amount");
      // assert.isDefined(remittance.hashedPassword1, "Password1 not defined");
      // assert.isDefined(remittance.hashedPassword2, "Password2 not defined");
    });
  });

  it("can withdraw funds for transfer recipient", function() {
    return remittance.withdrawFunds(hashedPassword1, hashedPassword2, {from: account_one, gas:3000000})
      .then(function(result) { 
      assert.equal(0x01, result.receipt.status, "No withdraw transaction");
      // return web3.eth.getBalancePromise(remittance.address);
      })
      // .then(function(balance) {
      // assert.equal(0, balance.toString(10), "No funds withdrawn");
      // })
  });
});