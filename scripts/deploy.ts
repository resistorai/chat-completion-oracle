import {ethers, run} from "hardhat";

async function main() {
    // Compile the contract
    const ChatCompletion = await ethers.getContractFactory("ChatCompletion");

    // Deploy the contract
    const chatCompletion = await ChatCompletion.deploy();
    await chatCompletion.deployed();
    console.log(`ChatCompletion deployed to: ${chatCompletion.address}`);

    // Verification (assuming you're using hardhat-etherscan or a similar plugin)
    setTimeout(async () => {
        try {
            await run("verify:verify", {
                address: chatCompletion.address,
                network: "resistor-testnet"
            });
            console.log(`Your contract address is: ${chatCompletion.address}`);
        } catch (error) {
            console.error("Verification failed:", error);
        }
    }, 5000);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
