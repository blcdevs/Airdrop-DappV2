// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Tinseltoken is ERC20, Ownable {
    // Token Details
    uint256 public constant INITIAL_SUPPLY = 200_000_000; // 200 million tokens
    uint8 private constant DECIMALS = 18;

    // Events
    event TokensBurned(address indexed burner, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);

    constructor() ERC20("Tinseltoken", "TNTC") {
        // Mint initial supply to deployer
        // Multiply by 10^18 to account for decimals
        _mint(msg.sender, INITIAL_SUPPLY * 10**DECIMALS);
    }

    // Burn tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    // Mint function (only owner)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // Override decimals function
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    // Return total supply in a readable format
    function totalSupplyInReadableFormat() external view returns (uint256) {
        return totalSupply() / 10**DECIMALS;
    }

    // Check balance in a readable format
    function balanceInReadableFormat(address account) external view returns (uint256) {
        return balanceOf(account) / 10**DECIMALS;
    }
}