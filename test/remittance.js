let Factory = artifacts.require("../contracts/RemittanceFactory.sol");
let Remittance = artifacts.require("../contracts/Remittance.sol");

Promise = require("bluebird");
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract('Testing Remittance', function(accounts) {

  let factory;
  let remittance;
  let limitDeadline = 5000;
  let secsToDeadline = 2000;
  let owner = accounts[0];
  let account_one = accounts[1];
  let password1 = "test1";
  let password2 = "test2";
  let hashedPassword1 = web3.sha3(password1);
  let hashedPassword2 = web3.sha3(password2);
  let sendAmount = 10;

  beforeEach(function () {
  return Factory.new(limitDeadline)
    .then(function (_instance) {
      factory = _instance;
      return Remittance.new(owner, account_one, hashedPassword1, hashedPassword2, secsToDeadline, {from: owner, value: sendAmount})
    })
    .then(function (_instance) {
      remittance = _instance;
    })
  });

  describe('Factory', function () {
    it('should deploy a factory', function () {
      assert.ok(web3.isAddress(factory.address));
    })
    it('should deploy a Remittance', function () {
      assert.ok(web3.isAddress(remittance.address));
    }) 
    it("should show all remittances", function () {
      return factory.getDeployedCampaigns()
      .then(function(result) {
      assert.equal(1, result.lenght, "Not all remittances shown"); //Not sure why this doesnt work
      })
    }) 
    it("should not deploy a Remittance with deadline > limit", function() {
      return Remittance.new(owner, account_one, hashedPassword1, hashedPassword2, 6000, {from: owner, value: sendAmount})
        .then(assert.fail)
        .catch(function(error) {
          assert.equal(error.message, 'assert.fail()') //What happens here???
        });
    })
  });

  describe('Remittance', function () {
    it("should withdraw funds for transfer recipient", function() {
      return remittance.withdrawFunds(password1, password2, {from: account_one, gas:3000000})
        .then(function(result) { 
        assert.equal(0x01, result.receipt.status, "No withdraw transaction");
        return web3.eth.getBalancePromise(remittance.address);
        })
        .then(function(balance) {
        assert.equal(0, balance.toString(10), "No funds withdrawn");
        })
    })
    it("should not reclaim funds for owner before deadline", function() {
      return remittance.reclaimFunds({from: owner, gas:3000000})
        .then(assert.fail)
        .catch(function(error) {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
        });
    })
    it("should reclaim funds for owner after deadline", function() {
      //return remittance.reclaimFunds({from: owner, gas:3000000}) Not sure how to test this one

    })
  })
});