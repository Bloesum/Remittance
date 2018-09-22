let Factory = artifacts.require("../contracts/RemittanceFactory.sol");
let Remittance = artifacts.require("../contracts/Remittance.sol");
const compiledRemittance = require('../build/contracts/Remittance.json');

Promise = require("bluebird");
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract('Testing Remittance', function(accounts) {

  let factory;
  let remmitance1;
  let remittance2;
  let limitDeadline = 5000;
  let secsToDeadline = 2000;
  let owner = accounts[0];
  let account_one = accounts[1];
  let account_two = accounts[2];
  let account_three = accounts[3];
  let account_four = accounts[4];
  let password1 = "test1";
  let password2 = "test2";
  let password3 = "test3";
  let password4 = "test4";
  let hashedPassword1 = web3.sha3(password1);
  let hashedPassword2 = web3.sha3(password2);
  let hashedPassword3 = web3.sha3(password3);
  let hashedPassword4 = web3.sha3(password4);
  let sendAmount1 = 10;
  let sendAmount2 = 20;

  before(function () {
  return Factory.new(limitDeadline)
    .then(function (_instance) {
      factory = _instance;
      return factory.createRemittance(account_one, hashedPassword1, hashedPassword2, secsToDeadline, {from: owner, value: sendAmount1})
    })
    .then(function () {
      return factory.createRemittance(account_three, hashedPassword3, hashedPassword4, secsToDeadline, {from: owner, value: sendAmount2})
    })
    .then(function () {
      return factory.getDeployedRemittances();
    })
    .then(function(_address) {
      remittance1 = Remittance.at(_address[0]);
      remittance2 = Remittance.at(_address[1]);
      // remittance1 = new web3.eth.contract(compiledRemittance.abi).at(_address[0]);
      // remittance2 = new web3.eth.contract(compiledRemittance.abi).at(_address[1]);
      // console.log("test:", remittance1);
    })
  });

  describe('Factory', function () {
    it('should deploy a factory', function () {
      assert.ok(web3.isAddress(factory.address));
    })
    it('should deploy a Remittance', function () {
      assert.ok(web3.isAddress(remittance1.address));
    }) 
    it("should show all remittances", function () {
      return factory.getDeployedRemittances()
      .then(function(result) {
      assert.equal(2, result.length, "Not all remittances shown");
      })
    }) 
    it("should not deploy a Remittance with deadline > limit", function() {
      return factory.createRemittance(account_one, hashedPassword1, hashedPassword2, 6000, {from: owner, value: sendAmount1})
      .then(assert.fail)
      .catch(function(error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert')
      });
    })
  });

  describe('Remittance', function () {
    it("should withdraw funds for transfer recipient", function() {
      return remittance1.withdrawFunds(password1, password2, {from: account_one, gas:3000000})
        .then(function(result) { 
        assert.equal(0x01, result.receipt.status, "No withdraw transaction");
        return web3.eth.getBalancePromise(remittance1.address);
        })
        .then(function(balance) {
        assert.equal(0, balance.toString(10), "No funds withdrawn");
        })
    })
    it("should not reclaim funds for owner before deadline", function() {
      return remittance1.reclaimFunds({from: owner, gas:3000000})
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