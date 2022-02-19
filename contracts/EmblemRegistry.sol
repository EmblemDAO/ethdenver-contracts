// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EmblemLibrary} from "./EmblemLibrary.sol";


contract EmblemRegistry is AccessControl, ERC1155 {

    // true if merkle root has been stored
    mapping(bytes32 => bool) private _merkleRoots;

    // maps BadgeDefinitionNumber to registries of winners (1 if badge has been won, 0 if not)
    // mapping(uint256 => mapping(address => uint256)) private _balances;


    constructor(string memory uri_) ERC1155(uri_) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function postMerkleRoot(
        bytes32 root
    ) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not EmblemRegistry admin");
        _merkleRoots[root] = true;
    }

    function hasMerkleRoot(
        bytes32 root
    ) public view returns (bool) {
        return _merkleRoots[root];
    }

    function mint(
        EmblemLibrary.BadgeStruct calldata badgeStruct,
        bytes32[] memory merkleProof,
        uint256[] memory positions,
        bytes32 merkleRoot
    ) public {
        require(_merkleRoots[merkleRoot] == true, "Merkle root not found");
        require(EmblemLibrary.verify(badgeStruct, merkleProof, positions, merkleRoot), "Invalid merkle proof");
        // _balances[badgeStruct.badgeDefinitionNumber][badgeStruct.winner] = 1;
        _mint(badgeStruct.winner, badgeStruct.badgeDefinitionNumber, 1, "");
    }

    function burn(
        address winner,
        uint256 badgeDefinitionNumber
    ) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not EmblemRegistry admin");
        // _balances[badgeDefinitionNumber][winner] = 0;
    }

    function balanceOf(address account, uint256 id) public view virtual override returns (uint256) {
        // require(account != address(0), "ERC1155: balance query for the zero address");
        // return _balances[id][account];
        return super.balanceOf(account, id);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
