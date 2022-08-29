//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Token.sol";

contract Exchange {
    // //create a variable instance of the token smart contract
    // Token public token
    // setting state variables
    address public feesAccount;
    uint256 public feePercent;
    address constant ETHER = address(0); // store ether in tokens mapping with blank address

    mapping(address => mapping(address => uint256)) public tokens;
    // store the order
    mapping(uint => _Order) public order;

    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderfilled;

    // create an order cache
    uint256 public orderCount;

    // model an order
    struct _Order {
        uint id;
        address tokenGive;
        uint256 amountGive;
        address tokenTake;
        uint256 amountTake;
        address user;
        uint timestamps;
    }
    // EVENTS
    event Deposit(
        address _tokenAddress,
        address sender,
        uint256 amountDeposited,
        uint256 balance
    );
    event Withdrawal(
        address _tokenAddress,
        address sender,
        uint256 amountDeposited,
        uint256 balance
    );
    event Order(
        uint256 id,
        address tokenGive,
        uint256 amountGive,
        address tokenTake,
        uint256 amountTake,
        address user,
        uint timestamps
    );
    event Cancel(
        uint256 id,
        address tokenGive,
        uint256 amountGive,
        address tokenTake,
        uint256 amountTake,
        address user,
        uint timestamps
    );
    event Trade(
        uint256 id,
        address tokenGive,
        uint256 amountGive,
        address tokenTake,
        uint256 amountTake,
        address user,
        address userFill,
        uint timestamps
    );

    constructor(address _feesAccount, uint256 _feePercent) public {
        feesAccount = _feesAccount;
        feePercent = _feePercent;
    }

    function depositEther() public payable {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender] += msg.value;
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint256 _amount) public payable {
        require(tokens[ETHER][msg.sender] >= _amount, "Insufficient balance");
        // (bool success, ) = payable(msg.sender).call{value: _amount}("");
        // require(success, "withdrawal failed");
        payable(msg.sender).transfer(_amount);
        tokens[ETHER][msg.sender] -= _amount;
        emit Withdrawal(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint256 _amount) public {
        require(_token != address(0)); //  prevent some one from using this function to deposit ether
        // Token(_token).approve(address(this), _amount);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != address(0));
        require(tokens[_token][msg.sender] >= _amount, "Insufficient balance");
        require(Token(_token).transfer(msg.sender, _amount));
        tokens[_token][msg.sender] -= _amount;
        emit Withdrawal(_token, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function balance(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }

    function makeOrder(
        address _tokenget,
        address _tokengive,
        uint256 _amountget,
        uint256 _amountgive
    ) public {
        orderCount = orderCount += 1;
        order[orderCount] = _Order(
            orderCount,
            _tokengive,
            _amountgive,
            _tokenget,
            _amountget,
            msg.sender,
            block.timestamp
        );
        emit Order(
            orderCount,
            _tokengive,
            _amountgive,
            _tokenget,
            _amountget,
            msg.sender,
            block.timestamp
        );
    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = order[_id];
        // must be my order
        //must be a valid order
        require(
            address(_order.user) == msg.sender,
            "You did not initiate the order"
        );
        require(_order.id == _id, "order does not exist");
        orderCancelled[_id] = true;
        emit Cancel(
            _order.id,
            _order.tokenGive,
            _order.amountGive,
            _order.tokenTake,
            _order.amountTake,
            msg.sender,
            block.timestamp
        );
    }

    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount);
        require(!orderfilled[_id]);
        require(!orderCancelled[_id]);
        //fetch order
        _Order storage _order = order[_id];
        //execute trade
        _trade(
            _order.id,
            _order.user,
            _order.tokenTake,
            _order.amountTake,
            _order.tokenGive,
            _order.amountGive
        );
        //mark order as filled
        orderfilled[_order.id] = true;
    }

    function _trade(
        uint256 _id,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        uint256 _feeAmount = _amountGive * (feePercent / (100));
        //execute trade
        tokens[_tokenGet][msg.sender] -= (_amountGet + _feeAmount); // fees would be paid by msg.sender
        tokens[_tokenGet][_user] += _amountGet;
        //charge fees
        tokens[_tokenGet][feesAccount] += _feeAmount;
        tokens[_tokenGive][msg.sender] += _amountGive;
        tokens[_tokenGive][_user] -= _amountGive;
        //mark order as filled
        //emit a trade event
        emit Trade(
            _id,
            _tokenGive,
            _amountGive,
            _tokenGet,
            _amountGet,
            _user,
            msg.sender,
            block.timestamp
        );
    }
}

// TO-DO LIST
// Set Fee account
// deposit ether
// withdraw ether
// deposit tokens
// withdraw tokens
// check balances
// make order
// cancel order
// fill order
// charge fees
