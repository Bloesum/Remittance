const Factory = artifacts.require("../contracts/RemittanceFactory.sol");
const Remittance = artifacts.require("../contracts/Remittance.sol");
const compiledRemittance = require('../build/contracts/Remittance.json');
const expectedExceptionPromise = require("./expected_exception_testRPC_and_geth.js");

Promise = require("bluebird");
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract('Testing Remittance', function(accounts) {

  let factory;
  let remmitance1;
  let remittance2;
  let owner = accounts[0];
  let account_one = accounts[1];
  let account_two = accounts[2];
  let account_three = accounts[3];
  let account_four = accounts[4];
  const password1 = "test1";
  const password2 = "test2";
  const password3 = "test3";
  const password4 = "test4";
  const hashedPassword1 = web3.sha3(password1);
  const hashedPassword2 = web3.sha3(password2);
  const hashedPassword3 = web3.sha3(password3);
  const hashedPassword4 = web3.sha3(password4);
  const limitDeadline = 5000;
  const secsToDeadline = 2000;
  const sendAmount1 = 10;
  const sendAmount2 = 20;

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
      return expectedExceptionPromise(function () {
        return factory.createRemittance(account_one, hashedPassword1, hashedPassword2, 6000, {from: owner, value: sendAmount1})
      })
    })
  });

  describe('Remittance', function () {
    it("should have given all remittances the transfer amount", function(){
      return web3.eth.getBalancePromise(remittance1.address)
      .then(function(balance1) {
        assert.equal(10, balance1.toString(10), "Remittance1 did not receive any funds");
        return web3.eth.getBalancePromise(remittance2.address)
      })
      .then(function(balance2) {
        assert.equal(20, balance2.toString(10), "Remittance2 did not receive any funds");
      })
    })
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
      return expectedExceptionPromise(function () {
        return remittance1.reclaimFunds({from: owner, gas:3000000})
      })
    })
    it("should reclaim funds for owner after deadline", function() {
      //Not sure how to test this one since block.timestamp cannot be simulated
    })
  })
});