const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const { gql, request, GraphQLClient } = require("graphql-request");


const MERKLE_TREE_SIZE = 256;
const MERKLE_TREE_STARTING_INDEX = 0;
const BADGE_TO_PROVE = 18;

const EMBLEM_LIBRARY_CONTRACT_NAME = "EmblemLibrary";
const EMBLEM_LIBRARY_ADDRESS_HARDHAT = "0x59753aaaF864e36eacDce8D68245DE655e028425";
const EMBLEM_LIBRARY_ADDRESS_RINKEBY = "0x82101A5169c37DC98CD9C520dF69633a00C24573";
const EMBLEM_LIBRARY_ADDRESS_MATIC = "0x99df1B14E329375Cd98B9dF92caE0aa92582DFF9";

const EMBLEM_REGISTRY_CONTRACT_NAME = "EmblemRegistry";
const EMBLEM_REGISTRY_CONTRACT_ADDRESS_HARDHAT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const EMBLEM_REGISTRY_CONTRACT_ADDRESS_RINKEBY = "0x69E5aCf3ed05CDFa14d3c30ae5C97D750Ba9a979";
const EMBLEM_REGISTRY_CONTRACT_ADDRESS_MATIC = "0x7C07D214a0B6D65E41E99Ae73ef2c1c4F7975A40";

const EMBLEM_GQL_ENDPOINT = "https://api.studio.thegraph.com/query/21610/ethdenver-stage/0.0.1";
const EMBLEM_EARNED_BADGE_COUNT_QUERY = gql`
    query getMerkleLeaves($startingIndex: Int, $treeSize: Int) {
        earnedBadgeCounts(first: $treeSize, skip: $startingIndex, orderBy: globalBadgeNumber) {
            earnedBadge {
                badgeWinner {
                    id
                }
                definition {
                    badgeDefinitionNumber
                }
            }
        }
    }`


async function main() {
    const client = new GraphQLClient(EMBLEM_GQL_ENDPOINT);
    const [badgeStruct, proof, positions, root] = await proofForEarnedBadgeCount(
        BADGE_TO_PROVE, 
        MERKLE_TREE_STARTING_INDEX, 
        MERKLE_TREE_SIZE, 
        client
    );
    console.log("Winner: " + badgeStruct.winner + "\nBadgeDefinitionNumber: " + badgeStruct.badgeDefinitionNumber +
    "\nProof: " + proof.toString() + "\nPositions: " + positions.toString() + "\nRoot: " + root);

    const registryContractFactory = await ethers.getContractFactory(
        EMBLEM_REGISTRY_CONTRACT_NAME,
        {
            libraries: {
              EmblemLibrary: EMBLEM_LIBRARY_ADDRESS_MATIC
            }
        }
    );
    const registryContract = await registryContractFactory.attach(EMBLEM_REGISTRY_CONTRACT_ADDRESS_MATIC);


    await registryContract.mint(badgeStruct, proof, positions, root);
    // const balanceAfterMint = await registryContract.balanceOf(badgeStruct.winner, badgeStruct.badgeDefinitionNumber);
    // console.log("balance after mint: " + balanceAfterMint);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


async function getLeavesFromSubgraph(_startingIndex, _treeSize, client) {
    const variables = {
        startingIndex: _startingIndex,
        treeSize: _treeSize
    };

    const earnedBadgeCounts = (await client.request(EMBLEM_EARNED_BADGE_COUNT_QUERY, variables)).earnedBadgeCounts;
    return earnedBadgeCounts;
}

async function proofForEarnedBadgeCount(earnedBadgeCountIndex, _startingIndex, _treeSize, client) {
    const leaves = await getLeavesFromSubgraph(_startingIndex, _treeSize, client);
    const hashedLeaves = leaves.map(earnedBadgeCount => hashBadge(earnedBadgeCount.earnedBadge));
    const tree = new MerkleTree(hashedLeaves, keccak256, { sortPairs: false });
    const proof = tree.getHexProof(hashedLeaves[earnedBadgeCountIndex]);
    const positions = tree.getProof(hashedLeaves[earnedBadgeCountIndex]).map(x => x.position === 'right' ? 1 : 0);
    const solidityBadge = {
        winner: leaves[earnedBadgeCountIndex].earnedBadge.badgeWinner.id,
        badgeDefinitionNumber: leaves[earnedBadgeCountIndex].earnedBadge.definition.badgeDefinitionNumber
    };
    return [solidityBadge, proof, positions, tree.getHexRoot()];
}

function hashBadge(earnedBadge) {
    let hashedBadge = ethers.utils.solidityKeccak256(
      ['address', 'int8'],
      [earnedBadge.badgeWinner.id, earnedBadge.definition.badgeDefinitionNumber]
    );
    return hashedBadge;
}




// async function deployEmblemRegistryContract() {
//     const emblemLibraryContract = await deployEmblemLibraryContract();
//     const emblemRegistryContractFactory = await ethers.getContractFactory(
//         EMBLEM_REGISTRY_CONTRACT_NAME,
//         {
//             libraries: {
//               EmblemLibrary: emblemLibraryContract.address
//             }
//         }
//     );
//     const emblemRegistryContract = await emblemRegistryContractFactory.deploy(MUMBAI_FX_CHILD);
//     await emblemRegistryContract.deployed();
//     return emblemRegistryContract;
// }

// async function deployEmblemLibraryContract() {
//     const emblemLibraryContractFactory = await ethers.getContractFactory(EMBLEM_LIBRARY_CONTRACT_NAME);
//     const emblemLibraryContract = await emblemLibraryContractFactory.deploy();
//     await emblemLibraryContract.deployed();
//     return emblemLibraryContract;
// }