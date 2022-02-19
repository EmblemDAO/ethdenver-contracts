const EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME = "EmblemSubgraphController";

async function main() {
    const subgraphControllerContract = await deploySubgraphControllerContract();
    console.log("EmblemSubgraphController contract deployed to " + subgraphControllerContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function deploySubgraphControllerContract() {
    const subgraphControllerContractFactory = await ethers.getContractFactory(EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME);
    const subgraphControllerContract = await subgraphControllerContractFactory.deploy();
    await subgraphControllerContract.deployed();
    return subgraphControllerContract;
}