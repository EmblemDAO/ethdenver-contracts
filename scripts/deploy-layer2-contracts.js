const EMBLEM_LIBRARY_CONTRACT_NAME = "EmblemLibrary";
const EMBLEM_REGISTRY_CONTRACT_NAME = "EmblemRegistry";


async function main() {
    const emblemRegistryContract = await deployEmblemRegistryContract();
    console.log("EmblemRegistry contract deployed to " + emblemRegistryContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function deployEmblemRegistryContract() {
    const emblemLibraryContract = await deployEmblemLibraryContract();
    console.log("EmblemLibrary contract deployed to " + emblemLibraryContract.address);
    const emblemRegistryContractFactory = await ethers.getContractFactory(
        EMBLEM_REGISTRY_CONTRACT_NAME,
        {
            libraries: {
              EmblemLibrary: emblemLibraryContract.address
            }
        }
    );
    const emblemRegistryContract = await emblemRegistryContractFactory.deploy("uri/");
    await emblemRegistryContract.deployed();
    return emblemRegistryContract;
}

async function deployEmblemLibraryContract() {
    const emblemLibraryContractFactory = await ethers.getContractFactory(EMBLEM_LIBRARY_CONTRACT_NAME);
    const emblemLibraryContract = await emblemLibraryContractFactory.deploy();
    await emblemLibraryContract.deployed();
    return emblemLibraryContract;
}