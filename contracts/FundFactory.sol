// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

import "./EndaomentAdminStorage.sol";
import "./Fund.sol";
import "./ProxyFactory.sol";

// FUND FACTORY CONTRACT
/**
 * @title FundFactory
 * @author rheeger
 * @notice FundFactory is a contract that allows the Endaoment ADMIN or ACCOUNTANT to
 * instantiate new Fund contracts.
 */
contract FundFactory is ProxyFactory, EndaomentAdminStorage {
  // ========== EVENTS ==========
  event FundCreated(address indexed newAddress);
  event FundLogicDeployed(address logicAddress);

  // ========== STATE VARIABLES==========

  address public immutable fundLogic; // logic template for all Fund contracts

  // ========== CONSTRUCTOR ==========
  /**
   * @notice Create new Fund Factory
   * @param adminContractAddress Address of EndaomentAdmin contract.
   */
  constructor(address adminContractAddress) public {
    // Set endaoment admin
    require(adminContractAddress != address(0), "FundFactory: Admin cannot be the zero address");
    endaomentAdmin = adminContractAddress;
    emit EndaomentAdminChanged(address(0), adminContractAddress);

    // Deploy and initialize Fund logic contract (used to deploy minimal proxies in createFund)
    // We set the address of the fund manager to whoever deployed this contract. Since this
    // instance will not be used as anything other than a logic template, the address used
    // as the fund manager does not matter much
    Fund fundLogicContract = new Fund();
    fundLogicContract.initializeFund(msg.sender, address(this));

    // Save off address so we can reference for all future deployments
    fundLogic = address(fundLogicContract);
    emit FundLogicDeployed(address(fundLogicContract));
  }

  // ========== Fund Creation & Management ==========
  /**
   * @notice Creates new Fund and emits a `FundCreated` event.
   * @param managerAddress The address of the Fund's Primary Advisor
   */
  function createFund(address managerAddress)
    public
    onlyAdminOrRole(endaomentAdmin, IEndaomentAdmin.Role.ACCOUNTANT)
  {
    require(managerAddress != address(0), "FundFactory: Manager cannot be the zero address");
    bytes memory payload = abi.encodeWithSignature(
      "initializeFund(address,address)",
      managerAddress,
      address(this)
    );
    address newFund = deployMinimal(fundLogic, payload);
    emit FundCreated(newFund);
  }
}
