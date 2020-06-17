// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.10;

interface ERC20 {
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function transfer(address to, uint tokens) external returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
}
