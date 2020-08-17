// SPDX-License-Identifier: MIT
pragma solidity ^0.6.7;

contract ProxyFactory {
  /**
   * @dev This function enables deployment of EIP-1167 minimal proxies. The code below
   * was copied from the OpenZeppelin ProxyFactory.sol contract, as there is currently
   * no package that has a version compatible with Solidity ^0.6.0. At the time of writing
   * copy/pasting the file in this manner is considered the best practive for ^0.6.0:
   *   https://forum.openzeppelin.com/t/best-practice-for-using-proxyfactory-sol-in-a-solidity-0-6-project-deploying-minimal-proxies/3478
   *
   * EIP-1167 references:
   *   The EIP and associated CloneFactory repo
   *     - https://eips.ethereum.org/EIPS/eip-1167
   *   Open Zeppelin blog post and discussion
   *     - https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
   *     - https://forum.openzeppelin.com/t/deep-dive-into-the-minimal-proxy-contract/1928
   */
  function deployMinimal(address _logic, bytes memory _data) public returns (address proxy) {
    // Adapted from https://github.com/optionality/clone-factory/blob/32782f82dfc5a00d103a7e61a17a5dedbd1e8e9d/contracts/CloneFactory.sol
    bytes20 targetBytes = bytes20(_logic);
    assembly {
      let clone := mload(0x40)
      mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(clone, 0x14), targetBytes)
      mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
      proxy := create(0, clone, 0x37)
    }

    if (_data.length > 0) {
      (bool success, ) = proxy.call(_data);
      require(success, "ProxyFactory: Initialization of proxy failed");
    }
  }
}
