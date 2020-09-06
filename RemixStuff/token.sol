pragma solidity 0.5.12;

import "./Ownable.sol";
import "./SafeMath.sol";

contract ERC20 is Ownable {

    using SafeMath for uint256;

    mapping (address => uint256) private _balances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor (string memory name, string memory symbol) public {
        _name = name;
        _symbol = symbol;
        _decimals = 18;
    }


    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function mint(address account, uint256 amount) public onlyOwner {
        require(account != address(0), "Not allowed to mint to 0 address");
        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances.add(amount);
        return;
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        // Check balance
        require(balanceOf[msg.sender] >= amount, "Insufficient balance for requested transfer");

        // Save pre-txn balances
        uint256 initialSenderBalance = balanceOf[msg.sender];
        uint256 initialRecipientBalance = balanceOf[recipient];

        // Update _balances
        uint xfrAmount = amount;
        _balances[msg.sender] = _balances[msg.sender].sub(xfrAmount);
        _balances[recipient] = _balances[recipient].add(xfrAmount);

        // Transfer tokens
        msg.sender.transfer(xfrAmount);

        // Assert new balances are updated accurately
        assert(balanceOf[recipient] == initialRecipientBalance.add(xfrAmount));
        assert(balanceOf[msg.sender] == initialSenderBalance.sub(xfrAmount));

        return true;
    }
}