//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("Vertex Token", "VTX") {
        _mint(msg.sender, 250000000 * (10**18));
    }

    function mint(address _account, uint256 _amount) internal {
        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) internal {
        _burn(_account, _amount);
    }
}
