/**
 * @title Resistor AI Chat Completion Oracle V1 - Testnet
 * Resistor AI
 */
// solhint-disable custom-errors

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract ChatCompletion {
  address private _adminAddress = address(0);
  address private _oracleAddress = address(0);
  uint256 public _callPrice = 1 * 10**16; // 0.01 TOR per Chat Completion

  uint32 private _requestCount = 1;
  mapping(bytes32 => bool) public _pendingRequests;
  mapping(bytes32 => string) public _queries;
  mapping(bytes32 => string) public _responses;

  event ChatCompletionRequested(bytes32 indexed id, address requester, address oraclet, uint256 price, string prompt);
  event ChatCompletionFulfilled(bytes32 indexed id, string response);

  constructor() {
    _adminAddress = msg.sender;
    _oracleAddress = msg.sender;
  }


  /**
   * @notice Creates a Chat Completion to be fulfilled by a Resistor oracle or miner
   * @dev This method receives a message input, iterates a new requestId, sends the funds
     to the oracle and emit an event that will trigger the off-chain routine.
   * Emits ChatCompletionRequested event.
   * @param message The chat completion request message
   * @return requestId The Chat Completion request ID
   */

  function requestCompletion(
    string calldata message
  ) external payable returns (bytes32) {
    require(msg.value >= _callPrice, "Insufficient funds sent.");

    bytes32 requestId = keccak256(abi.encodePacked(this, _requestCount));
    _requestCount = _requestCount + 1;
    _queries[requestId] = message;
    _pendingRequests[requestId] = true;
    payable(_oracleAddress).transfer(msg.value);

    emit ChatCompletionRequested(requestId, msg.sender, _oracleAddress, msg.value, message);

    return requestId;
  }

  /**
   * @notice Fulfills the Chat Completion request sending the response data as a string.
   * @dev After the oracle performs the off-chain routine, it will send the response data
   to this method
   * Emits ChatCompletionFulfilled event.
   * @param requestId The Chat Completion Request ID
   * @param response The Chat Completion Response String
   */

  function fulfill(
    bytes32 requestId,
    string memory response
  ) external onlyPending(requestId) {
    require(msg.sender == _oracleAddress, "Only the designated oracle can fulfill requests.");
    _responses[requestId] = response;
    delete _pendingRequests[requestId];
    emit ChatCompletionFulfilled(requestId, response);
  }

  /**
   * @notice the next request count to be used in generating a nonce
   * @dev starts at 1 in order to ensure consistent gas cost
   * @return returns the next request count to be used in a nonce
   */
  function _getNextRequestId() internal view returns (uint256) {
    return _requestCount;
  }

  /**
   * @notice Updates the Oracle Address
   * @param oracleAddress: The address of the oracle contract
   */
  function updateOracle(address oracleAddress) external  {
    require(msg.sender == _adminAddress, "Only an administrator can call this function");
    _oracleAddress = oracleAddress;
  }

    /**
   * @notice Gets the Chat Completion query message of a request
   * @param requestId: The Chat Completion Request ID
   * @return returns the request's query string
   */
  function getQuery(bytes32 requestId) external view returns (string memory)  {
    return _queries[requestId];
  }

    /**
   * @notice Gets the Chat Completion request response
   * @param requestId: The Chat Completion Request ID
   * @return returns the request's response string
   */
  function getResponse(bytes32 requestId) external view returns (string memory)  {
    return _responses[requestId];
  }

    /**
   * @notice Checks if a request is still pending
   * @param requestId: The Chat Completion Request ID
   * @return returns a boolean if the request is pending or not
   */
  function isPending(bytes32 requestId) external view returns (bool)  {
    return _pendingRequests[requestId] == true;
  }

  /**
   * @dev Reverts if the request is not pending.
   * @param requestId The request ID to fulfill
   */
  modifier onlyPending(bytes32 requestId) {
    require(_pendingRequests[requestId] == true, "This request is not pending");
    _;
  }
}