import { waffle, ethers } from "hardhat";
import { setup, IUser, ISuperToken } from "../misc/setup";
import { common } from "../misc/common";
import { expect } from "chai";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { REXUniswapV3Market, REXReferral__factory } from "../typechain";
import { increaseTime, impersonateAndSetBalance } from "../misc/helpers";
import { Constants } from "../misc/Constants";
import { HttpService } from "../misc/HttpService";

const { provider } = waffle;
const TEST_TRAVEL_TIME = 3600 * 2; // 2 hours
const ONE_WEEK = 3600 * 24 * 7; // 1 week
// Index 1 is for Ether and 0 for USDCx
const USDCX_SUBSCRIPTION_INDEX = 0;
const ETHX_SUBSCRIPTION_INDEX = 1;
const RIC_SUBSCRIPTION_INDEX = 2;

// Constants for Gelato
const GELATO_OPS = "0x527a819db1eb0e34426297b03bae11F2f8B3A19E"; // Mainnet Gelato Ops Address
const GELATO_NETWORK = "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA"; // Mainnet Gelato Executor Address
const UNISWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Mainnet Uniswap Router Address
const ONE_USDC = ethers.BigNumber.from("1000000");
const GELATO_FEE = ethers.BigNumber.from("100000"); // 100k wei

const config = Constants["polygon"];

export interface superTokenIDAIndex {
    token: SuperToken;
    IDAIndex: number;
}

describe('REXUniswapV3Market', () => {
    const errorHandler = (err: any) => {
        if (err) throw err;
    };

    const overrides = { gasLimit: '10000000' }; // Using this to manually limit gas to avoid giga-errors.
    const inflowRateUsdc = "1000000000000000";
    const inflowRateUsdcDeposit = "4000000000000000"
    const inflowRateUsdc10x = "10000000000000000";
    const inflowRateEth = "10000000000000";
    const subsidyRate = "10000000000000";

    let rexReferral: REXReferral__factory;
    let REXMarketFactory: any;
    let referral: any;
    let snapshot: any;

    let adminSigner: SignerWithAddress;
    let aliceSigner: SignerWithAddress;
    let bobSigner: SignerWithAddress;
    let carlSigner: SignerWithAddress;
    let usdcxWhaleSigner: SignerWithAddress;
    let ethxWhaleSigner: SignerWithAddress;
    let maticxWhaleSigner: SignerWithAddress;
    let ricWhaleSigner: SignerWithAddress;
    let karenSigner: SignerWithAddress;

    let oraclePrice = 1770;
    let ricOraclePrice = 30000000;
    let maticOraclePrice: number;

    // interface SuperTokensBalances {
    //     outputx: string[];
    //     ethx: string[];
    //     wbtcx: string[];
    //     daix: string[];
    //     usdcx: string[];
    //     ric: string[];
    // };

    let appBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
    let ownerBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
    let aliceBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
    let bobBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
    let carlBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
    let karenBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };

    let sf: Framework,
        superT: ISuperToken,
        u: { [key: string]: IUser },
        market: REXUniswapV3Market,
        tokenss: { [key: string]: any },
        sfRegistrationKey: any,
        accountss: SignerWithAddress[],
        constant: { [key: string]: string },
        ERC20: any;

    // ************** All the supertokens used in Ricochet are declared **********************
    let ricochetMATICx: SuperToken;
    let ricochetUSDCx: SuperToken;
    let ricochetETHx: SuperToken;
    let ricochetWBTCx: SuperToken;
    let ricochetRIC: SuperToken;
    let ricochetRexSHIRT: SuperToken;

    let usdcxIDAIndex: superTokenIDAIndex;
    let ethxIDAIndex: superTokenIDAIndex;
    let ricIDAIndex: superTokenIDAIndex;
    let rexshirtIDAIndex: superTokenIDAIndex;
    let wbtcxIDAIndex: superTokenIDAIndex;
    let maticxIDAIndex: superTokenIDAIndex;

    // ***************************************************************************************

    let gelatoBlock;
    let intializeMarketBlock;

    async function takeMeasurements(balances: SuperTokensBalances, signer: SignerWithAddress): Promise<void> {

        // TODO: Please 
        appBalances.ethx.push((await superT.ethx.balanceOf({ account: market.address, providerOrSigner: provider })).toString());
        ownerBalances.ethx.push((await superT.ethx.balanceOf({ account: u.admin.address, providerOrSigner: provider })).toString());
        aliceBalances.ethx.push((await superT.ethx.balanceOf({ account: u.alice.address, providerOrSigner: provider })).toString());
        carlBalances.ethx.push((await superT.ethx.balanceOf({ account: u.carl.address, providerOrSigner: provider })).toString());
        bobBalances.ethx.push((await superT.ethx.balanceOf({ account: u.bob.address, providerOrSigner: provider })).toString());

        appBalances.usdcx.push((await superT.usdcx.balanceOf({ account: market.address, providerOrSigner: provider })).toString());
        ownerBalances.usdcx.push((await superT.usdcx.balanceOf({ account: u.admin.address, providerOrSigner: provider })).toString());
        aliceBalances.usdcx.push((await superT.usdcx.balanceOf({ account: u.alice.address, providerOrSigner: provider })).toString());
        carlBalances.usdcx.push((await superT.usdcx.balanceOf({ account: u.carl.address, providerOrSigner: provider })).toString());
        bobBalances.usdcx.push((await superT.usdcx.balanceOf({ account: u.bob.address, providerOrSigner: provider })).toString());

        appBalances.ric.push((await superT.ric.balanceOf({ account: market.address, providerOrSigner: provider })).toString());
        ownerBalances.ric.push((await superT.ric.balanceOf({ account: u.admin.address, providerOrSigner: provider })).toString());
        aliceBalances.ric.push((await superT.ric.balanceOf({ account: u.alice.address, providerOrSigner: provider })).toString());
        carlBalances.ric.push((await superT.ric.balanceOf({ account: u.carl.address, providerOrSigner: provider })).toString());
        bobBalances.ric.push((await superT.ric.balanceOf({ account: u.bob.address, providerOrSigner: provider })).toString());

        appBalances.rexshirt.push((await superT.rexshirt.balanceOf({ account: market.address, providerOrSigner: provider })).toString());
        ownerBalances.rexshirt.push((await superT.rexshirt.balanceOf({ account: u.admin.address, providerOrSigner: provider })).toString());
        aliceBalances.rexshirt.push((await superT.rexshirt.balanceOf({ account: u.alice.address, providerOrSigner: provider })).toString());
        carlBalances.rexshirt.push((await superT.rexshirt.balanceOf({ account: u.carl.address, providerOrSigner: provider })).toString());
        bobBalances.rexshirt.push((await superT.rexshirt.balanceOf({ account: u.bob.address, providerOrSigner: provider })).toString());

        appBalances.maticx.push((await superT.maticx.balanceOf({ account: market.address, providerOrSigner: provider })).toString());
        ownerBalances.maticx.push((await superT.maticx.balanceOf({ account: u.admin.address, providerOrSigner: provider })).toString());
        aliceBalances.maticx.push((await superT.maticx.balanceOf({ account: u.alice.address, providerOrSigner: provider })).toString());
        carlBalances.maticx.push((await superT.maticx.balanceOf({ account: u.carl.address, providerOrSigner: provider })).toString());
        bobBalances.maticx.push((await superT.maticx.balanceOf({ account: u.bob.address, providerOrSigner: provider })).toString());
    }

    async function resetMeasurements(): Promise<void> {
        appBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
        ownerBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
        aliceBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
        bobBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
        carlBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
        karenBalances = { ethx: [], usdcx: [], ric: [], maticx: [], rexshirt: [] };
    }

    async function approveSubscriptions(tokensAndIDAIndexes: superTokenIDAIndex[], signers: SignerWithAddress[]) {
        console.log("  ======== Inside approveSubscriptions ===========");
        let tokenIndex: number;
        for (let i = 0; i < signers.length; i++) {
            for (let j = 0; j < tokensAndIDAIndexes.length; j++) {
                tokenIndex = tokensAndIDAIndexes[j].IDAIndex;
                await sf.idaV1
                    .approveSubscription({
                        indexId: tokenIndex.toString(),
                        superToken: tokensAndIDAIndexes[j].token.address,
                        publisher: market.address,
                        userData: "0x",
                    })
                    .exec(signers[i]);
                console.log("====== ", i, " subscription to token ", j, " approved =======");
            }
        }
    }

    async function checkBalance(user: SignerWithAddress, name: string) {
        console.log(" checkBalance START ======== Balance of ", name, " with address: ", user.address, " ============= ");
        let balanceEthx = await ricochetETHx.balanceOf({
            account: user.address, providerOrSigner: provider
        });
        let balanceUsdcx = await ricochetUSDCx.balanceOf({
            account: user.address, providerOrSigner: provider
        });
        let balanceRic = await ricochetRIC.balanceOf({
            account: user.address, providerOrSigner: provider
        });
        let balanceMatic = await ricochetMATICx.balanceOf({
            account: user.address, providerOrSigner: provider
        });
        console.log("Balance in ETHX: ", balanceEthx);
        console.log("Balance in USDCX: ", balanceUsdcx);
        console.log("Balance in RIC: ", balanceRic);
        console.log("Balance in MATICx: ", balanceMatic);
        console.log(" checkBalance END ====================================================== ");
    }

    async function delta(account: SignerWithAddress, balances: any) {
        const len = balances.ethx.length;
        return {
            ethx: balances.ethx[len - 1] - balances.ethx[len - 2],
            usdcx: balances.usdcx[len - 1] - balances.usdcx[len - 2],
            ric: balances.ric[len - 1] - balances.ric[len - 2],
            maticx: balances.maticx[len - 1] - balances.maticx[len - 2],
            rexshirt: balances.rexshirt[len - 1] - balances.rexshirt[len - 2]
        }
    }

    before(async () => {
        const {
            superfluid,
            users,
            accounts,
            tokens,
            superTokens,
            contracts,
            constants,
        } = await setup();
        console.log("============ Right after initSuperfluid() ==================");

        const { createSFRegistrationKey } = await common();

        u = users;
        sf = superfluid;
        superT = superTokens;
        tokenss = tokens;
        accountss = accounts;
        sfRegistrationKey = createSFRegistrationKey;
        constant = constants;

        // This order is established in misc/setup.ts
        adminSigner = accountss[0];
        aliceSigner = accountss[1];
        bobSigner = accountss[2];
        carlSigner = accountss[3];
        karenSigner = accountss[4];
        usdcxWhaleSigner = accountss[5];
        ethxWhaleSigner = accountss[6];
        maticxWhaleSigner = accountss[7];
        ricWhaleSigner = accountss[10];

        ricochetMATICx = superT.maticx;
        ricochetUSDCx = superT.usdcx;
        ricochetETHx = superT.ethx;
        ricochetWBTCx = superT.wbtcx;
        ricochetRIC = superT.ric;
        ricochetRexSHIRT = superT.rexshirt;

        ethxIDAIndex = {
            token: ricochetETHx,
            IDAIndex: 0,
        }
        ricIDAIndex = {
            token: ricochetRIC,
            IDAIndex: 1,
        }

        // ==============================================================================
        const registrationKey = await sfRegistrationKey(sf, adminSigner.address);
        console.log("============ Right after sfRegistrationKey() ==================");
        // ==============================================================================

        // Deploy REXReferral
        rexReferral = await ethers.getContractFactory("REXReferral", {
            signer: adminSigner,
        });
        referral = await rexReferral.deploy();
        await referral.deployed();
        console.log("=========== Deployed REXReferral ============");

         // Update the oracle price for ethereum
         let httpService = new HttpService();
         const url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
         let response = await httpService.get(url);
         oraclePrice = parseInt(response.data['ethereum'].usd); 
         console.log("Oracle price: ", oraclePrice);

        // ==============
        // Deploy REX Market
        console.log("Deploying REXUniswapV3Market...");
        REXMarketFactory = await ethers.getContractFactory(
            "REXUniswapV3Market",
            adminSigner
        );


        // Log the arguments for the deploy method before calling it
        console.log(
            "Arguments for REXUniswapV3Market deploy:",
            adminSigner.address,
            config.HOST_SUPERFLUID_ADDRESS,
            config.CFA_SUPERFLUID_ADDRESS,
            config.IDA_SUPERFLUID_ADDRESS,
            registrationKey,
            referral.address,
            config.GELATO_OPS,
            adminSigner.address
        );


        market = await REXMarketFactory.deploy(
            adminSigner.address,
            config.HOST_SUPERFLUID_ADDRESS,
            config.CFA_SUPERFLUID_ADDRESS,
            config.IDA_SUPERFLUID_ADDRESS,
            registrationKey,
            referral.address,
            config.GELATO_OPS,
            adminSigner.address
        );
        console.log("=========== Deployed REXUniswapV3Market ============");

        // Initialize MATIC
        console.log("config.WMATIC_ADDRESS", config.WMATIC_ADDRESS)
        console.log("config.MATICX_ADDRESS", config.MATICX_ADDRESS)
        await market.initializeMATIC(config.WMATIC_ADDRESS, config.MATICX_ADDRESS);
        console.log("=========== Initialized MATIC ============");
        

        await market.createTask();
        gelatoBlock = await ethers.provider.getBlock("latest");
        console.log("========== Created Task ===========");

        await market.initializeMarket(
            ricochetUSDCx.address,
            ricochetETHx.address,
            ricochetRIC.address,
            config.SHARE_SCALER, 
            config.FEE_RATE,
            config.AFFILAITE_FEE,
            oraclePrice.toString() + "000000000000000000", // "0" * 18
            config.RATE_TOLERANCE,
        );

        // Save this block number for expectations below
        intializeMarketBlock = await ethers.provider.getBlock("latest");

        await market.initializeUniswap(
            config.UNISWAP_V3_ROUTER_ADDRESS, 
            config.UNISWAP_V3_FACTORY_ADDRESS,
            [config.USDC_ADDRESS, config.ETH_ADDRESS],
            500
        );

        // Send the market some RIC for subsidies
        await ricochetRIC.transfer({
            receiver: market.address,
            amount: "1000000000000000000"
        }).exec(ricWhaleSigner);

        // Register the market with REXReferral
        await referral.registerApp(market.address);
        referral = await referral.connect(carlSigner);
        await referral.applyForAffiliate("carl", "carl");
        referral = await referral.connect(adminSigner);
   
        // Give Alice, Bob, Karen some tokens
        const initialAmount = ethers.utils.parseUnits("1000", 18).toString();

        // USDCx for Alice
        await ricochetUSDCx
            .transfer({
                receiver: aliceSigner.address,
                amount: initialAmount,
            }).exec(usdcxWhaleSigner);

        // USDCx for Bob 
        await ricochetUSDCx
            .transfer({
                receiver: bobSigner.address,
                amount: initialAmount,
            }).exec(usdcxWhaleSigner);

        // RIC for Bob
        await ricochetRIC
            .transfer({
                receiver: bobSigner.address,
                amount: '1000000000000000000000',
            }).exec(ricWhaleSigner);

        // RIC for market
        await ricochetRIC
            .transfer({
                receiver: market.address,
                amount: '1000000000000000000000',
            }).exec(ricWhaleSigner);
        
        // MATICx for Bob
        await ricochetMATICx
            .transfer({
                receiver: bobSigner.address,
                amount: '1754897259852523432',
            }).exec(maticxWhaleSigner);
        
        // USDCx for Karen
        await ricochetUSDCx
            .transfer({
                receiver: karenSigner.address,
                amount: initialAmount,
            }).exec(usdcxWhaleSigner);
        console.log("====== Transferred USDCx to karen =======");

        // Do all the approvals
        await approveSubscriptions([ethxIDAIndex, ricIDAIndex],
            [adminSigner, aliceSigner, bobSigner, carlSigner]); // karenSigner


        // Take a snapshot to avoid redoing the setup, this saves some time later in the testing scripts
        snapshot = await provider.send('evm_snapshot', []);

       
    });

    context.only("#1 - new rexmarket with no streamers", async () => {

        beforeEach(async () => {
            // Revert to the point REXMarket was just deployed
            const success = await provider.send('evm_revert', [
                snapshot
            ]);
            // Take another snapshot to be able to revert again next time
            snapshot = await provider.send('evm_snapshot', []);
            expect(success).to.equal(true);
        });

        afterEach(async () => {
            // Check the app isn't jailed
            // expect(await market.isAppJailed()).to.equal(false);
            await resetMeasurements();
        });

        after(async () => {

        });


        it("#1.1 contract variables were set correctly", async () => {

            expect(await market.owner()).to.equal(adminSigner.address);
            expect(await market.numOutputPools()).to.equal(2);
            expect(await market.lastDistributedAt()).to.equal(intializeMarketBlock.timestamp);   
            expect(await market.rateTolerance()).to.equal(config.RATE_TOLERANCE);
            expect(await market.feeRate()).to.equal(config.FEE_RATE);
            expect(await market.affiliateFee()).to.equal(config.AFFILAITE_FEE);
            expect(await market.shareScaler()).to.equal(config.SHARE_SCALER);
            expect(await market.inputToken()).to.equal(ricochetUSDCx.address);
            expect(await market.outputToken()).to.equal(ricochetETHx.address);
            expect(await market.subsidyToken()).to.equal(ricochetRIC.address);
            expect(await market.underlyingInputToken()).to.equal(config.USDC_ADDRESS);
            expect(await market.underlyingOutputToken()).to.equal(config.ETH_ADDRESS);
            expect(await market.wmatic()).to.equal(config.WMATIC_ADDRESS);
            expect(await market.maticx()).to.equal(config.MATICX_ADDRESS);
        });

        it("#1.2 before/afterAgreementCreated callbacks", async () => {

            // Alice opens a USDC stream to REXMarket
            console.log("========== Alice opens a USDC stream to REXMarket ===========");
            await sf.cfaV1.createFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateUsdc,
                userData: ethers.utils.defaultAbiCoder.encode(["string"], ["carl"]),
                shouldUseCallAgreement: true,
                overrides
            }).exec(aliceSigner);

            // Expect share allocations were done correctly
            expect(
                (await market.getIDAShares(0, aliceSigner.address)).toString()
            ).to.equal(`true,true,99500000000,0`);
            // Admin and Carl split 2% of the shares bc of the 50% referral fee
            expect(
                (await market.getIDAShares(0, adminSigner.address)).toString()
            ).to.equal(`true,true,250000000,0`);
            expect(
                (await market.getIDAShares(0, carlSigner.address)).toString()
            ).to.equal(`true,true,250000000,0`);

            // Give it a minute...
            await increaseTime(TEST_TRAVEL_TIME);

            // Bob opens a ETH stream to REXMarket
            console.log("========== Bob opens a USDC stream to REXMarket ===========");
            await sf.cfaV1.createFlow({
                sender: bobSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateEth,
                shouldUseCallAgreement: true,
                overrides
            }).exec(bobSigner);

            // Expect share allocations were done correctly
            expect(
                (await market.getIDAShares(0, bobSigner.address)).toString()
            ).to.equal(`true,true,995000000,0`);

            // Admin gets all of the 0.5% fee bc Bob was an organic referral
            expect(
                (await market.getIDAShares(0, adminSigner.address)).toString()
            ).to.equal(`true,true,255000000,0`); 

            // Delete Alices stream before first  distributions
            console.log("========== Delete Alices stream ===========")
            await sf.cfaV1.deleteFlow({
                receiver: market.address,
                sender: aliceSigner.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
            }).exec(aliceSigner);

            // Delete Alices stream before first  distributions
            console.log("========== Delete Bobs stream ===========")
            await sf.cfaV1.deleteFlow({
                receiver: market.address,
                sender: bobSigner.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
            }).exec(bobSigner);

        });

        it("#1.3 before/afterAgreementTerminated callbacks", async () => {

            await takeMeasurements();

            // Alice opens a USDC stream to REXMarket
            await sf.cfaV1.createFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateUsdc,
                userData: ethers.utils.defaultAbiCoder.encode(["string"], ["carl"]),
                shouldUseCallAgreement: true,
                overrides
            }).exec(aliceSigner);


            await increaseTime(3600)

            // Delete Alices stream before first  distributions
            await sf.cfaV1.deleteFlow({
                receiver: market.address,
                sender: aliceSigner.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
            }).exec(aliceSigner);


            await takeMeasurements();

            // Check balance for alice again
            let aliceDelta = await delta(aliceSigner, aliceBalances);

            // Expect alice didn't lose anything since she closed stream before distribute
            // expect(aliceDelta.usdcx).to.equal(0);
            expect(aliceDelta.usdcx).to.equal(0);
            expect(
                (await market.getIDAShares(0, aliceSigner.address)).toString()
            ).to.equal(`true,true,0,0`);
            expect(
                (await market.getIDAShares(0, adminSigner.address)).toString()
            ).to.equal(`true,true,0,0`);
            expect(
                (await market.getIDAShares(0, carlSigner.address)).toString()
            ).to.equal(`true,true,0,0`);

        });

        it("#1.4 manual distribution", async () => {
        
            // Alice opens a USDC stream to REXMarket
            await sf.cfaV1.createFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateUsdc,
                userData: ethers.utils.defaultAbiCoder.encode(["string"], ["carl"]),
                shouldUseCallAgreement: true,
            }).exec(aliceSigner);

            // Check balance
            await takeMeasurements();

            // Fast forward an hour and distribute
            await increaseTime(TEST_TRAVEL_TIME);
            await market.distribute("0x", true);
            
            await increaseTime(TEST_TRAVEL_TIME);
            await market.distribute("0x", true);

            await increaseTime(TEST_TRAVEL_TIME);
            await market.distribute("0x", true);

            // Check balances again
            await takeMeasurements();

            // Check oracle
            oraclePrice = await market.getTwap();

            // Compute the delta
            let deltaAlice = await delta(aliceSigner, aliceBalances);
            let deltaCarl = await delta(carlSigner, carlBalances);
            let deltaOwner = await delta(adminSigner, ownerBalances);

            // Expect Owner and Carl got their fee from Alice
            let totalOutput = deltaAlice.ethx + deltaCarl.ethx + deltaOwner.ethx;
            expect(deltaCarl.ethx / totalOutput).to.equal(0.0025)
            expect(deltaOwner.ethx / totalOutput).to.equal(0.0025)
            console.log("Alice exchange rate:", deltaAlice.usdcx / deltaAlice.ethx)
            expect(deltaAlice.ethx).to.be.above(deltaAlice.usdcx / oraclePrice * -1 * 0.985)

            // Delete alice and bobs flow
            await sf.cfaV1.deleteFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(aliceSigner);

        });

        it("#1.5 gelato distribution", async () => {
            const config = Constants['polygon'];

            // Impersonate gelato network and set balance
            await impersonateAndSetBalance(config.GELATO_NETWORK);
            const gelatoNetwork = await ethers.provider.getSigner(config.GELATO_NETWORK);
            const ops = await ethers.getContractAt("Ops", config.GELATO_OPS);

            // Setup gelato executor exec and module data
            let encodedArgs = ethers.utils.defaultAbiCoder.encode(
                ["uint128", "uint128"],
                [gelatoBlock.timestamp, 60]
            );
            let execData = market.interface.encodeFunctionData("distribute", ["0x", false]);
            let moduleData = {
                modules: [1],
                args: [encodedArgs],
            };

            // Alice opens a USDC stream to REXMarket
            await sf.cfaV1.createFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateUsdc10x, // Increase rate 10x to make sure gelato can be paid
                userData: ethers.utils.defaultAbiCoder.encode(["string"], ["carl"]),
                shouldUseCallAgreement: true,
            }).exec(aliceSigner);

            await takeMeasurements();
            await increaseTime(TEST_TRAVEL_TIME);

            // Submit task to gelato
            await ops
            .connect(gelatoNetwork)
            .exec(
                market.address,
                market.address,
                execData,
                moduleData,
                GELATO_FEE,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", 
                false, // true if payed with treasury
                true
            ); 
            console.log("Submitted task to gelato");
            await increaseTime(TEST_TRAVEL_TIME);
           
            // Submit task to gelato
            await ops
            .connect(gelatoNetwork)
            .exec(
                market.address,
                market.address,
                execData,
                moduleData,
                GELATO_FEE,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", 
                false, // true if payed with treasury
                true
            ); 
            console.log("Submitted task to gelato");

            // TODO: Not sure why the 3rd gelato execute fails
            // await increaseTime(TEST_TRAVEL_TIME);
            // // Submit task to gelato
            // await ops
            // .connect(gelatoNetwork)
            // .exec(
            //     market.address,
            //     market.address,
            //     execData,
            //     moduleData,
            //     GELATO_FEE,
            //     "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", 
            //     false, // true if payed with treasury
            //     true,
            //     {gasLimit: 1000000}
            // ); 

            // Check balances again
            await takeMeasurements();

            // Check oracle
            oraclePrice = await market.getTwap();

            // Compute the delta
            let deltaAlice = await delta(aliceSigner, aliceBalances);
            let deltaCarl = await delta(carlSigner, carlBalances);
            let deltaOwner = await delta(adminSigner, ownerBalances);

            // Expect Owner and Carl got their fee from Alice
            let totalOutput = deltaAlice.ethx + deltaCarl.ethx + deltaOwner.ethx;
            expect(deltaCarl.ethx / totalOutput).to.equal(0.0025)
            expect(deltaOwner.ethx / totalOutput).to.equal(0.0025)
            console.log("Alice exchange rate:", deltaAlice.usdcx / deltaAlice.ethx)
            expect(deltaAlice.ethx).to.be.above(deltaAlice.usdcx / oraclePrice * -1 * 0.985)

            // Delete alice and bobs flow
            await sf.cfaV1.deleteFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(aliceSigner);

        });

        // // Test that it will revert when the rate tolerance is too low bc of slippage
        it("#1.6 revert when rateTolerance is too low", async () => {

            // Alice opens a USDC stream to REXMarket
            await sf.cfaV1.createFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateUsdc10x,
                userData: ethers.utils.defaultAbiCoder.encode(["string"], ["carl"]),
                shouldUseCallAgreement: true,
            }).exec(aliceSigner);
            await increaseTime(TEST_TRAVEL_TIME);
            
            //  distribution and then wait 10x the test travel time
            market.distribute("0x", false)
            // Fast forward one week
            await increaseTime(ONE_WEEK);

            await market.setRateTolerance(1); // 0.01%

            // Expect revert on market.distribute due to the low rate tolerance
            await expect(
                market.distribute("0x", false)
            ).to.be.revertedWith("Too little received");

            // Delete alices flow
            await sf.cfaV1.deleteFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(aliceSigner);

            // Set the rateTolerance back to 0.5%
            await market.setRateTolerance(500);
        });

        // Test that it only accepts the inputToken, in this case USDCx
        // it.only("#1.7 revert when inputToken is not USDCx", async () => {

        //     // Expect revert createFlow with ETHx by Alice
        //     await expect(
        //         sf.cfaV1.createFlow({
        //             sender: aliceSigner.address,
        //             receiver: market.address,
        //             superToken: ricochetETHx.address,
        //             flowRate: '1000',
        //             shouldUseCallAgreement: true,
        //             overrides
        //         }).exec(aliceSigner)
        //     ).to.be.revertedWith("InvalidAgreement");

        // });
    });

    context("#2 - native supertoken outputToken with two streamers", async () => {

        // Uses the USDC/rexSHIRT Uniswap LPs where rexSHIRT is the supertoken outputToken

        before(async () => {
            // const success = await provider.send('evm_revert', [
            //     snapshot
            // ]);

            // Deploy RIC-USDC Rex Market
            const registrationKey = await sfRegistrationKey(sf, adminSigner.address);

            market = await REXMarketFactory.deploy(
                adminSigner.address,
                sf.settings.config.hostAddress,
                config.CFA_SUPERFLUID_ADDRESS,
                config.IDA_SUPERFLUID_ADDRESS,
                registrationKey,
                referral.address,
                GELATO_OPS,
                adminSigner.address
            );
            console.log("=========== Deployed REXUniswapV3Market ============");

            // Initialize MATIC
            console.log("config.WMATIC_ADDRESS", config.WMATIC_ADDRESS)
            console.log("config.MATICX_ADDRESS", config.MATICX_ADDRESS)
            await market.initializeMATIC(config.WMATIC_ADDRESS, config.MATICX_ADDRESS);
            console.log("=========== Initialized MATIC ============");

            await market.initializeMarket(
                ricochetUSDCx.address,
                ricochetRexSHIRT.address,
                ricochetRIC.address,
                10000,
                20000,
                "28593660946038398000", // 28.5 USDC/rexSHIRT pulled the rate on Uniswap
                5000,
            );
            console.log("========== Initialized market ===========");
            await market.createTask();
            gelatoBlock = await ethers.provider.getBlock("latest");
            console.log("========== Created gelato task ===========");
            // Initialize the twoway market's uniswap
            // token0 is USDC, token1 is rexSHIRT (supertokens)
            await market.initializeUniswap(
                config.UNISWAP_V3_ROUTER_ADDRESS, 
                config.UNISWAP_V3_FACTORY_ADDRESS,
                [config.USDC_ADDRESS, config.REXSHIRT_ADDRESS],
                [10000]
            );
            console.log("========== Initialized uniswap ===========");

            // Register the market with REXReferral
            await referral.registerApp(market.address);
            console.log("========== Registered market with REXReferral ===========");

            rexshirtIDAIndex = {
                token: ricochetRexSHIRT,
                IDAIndex: 0,
            }
            ricIDAIndex = {
                token: ricochetRIC,
                IDAIndex: 1,
            }

            await approveSubscriptions([rexshirtIDAIndex, ricIDAIndex],
                [adminSigner, aliceSigner, carlSigner]); // bobSigner

            // Alice opens a USDC stream to REXMarket
            await sf.cfaV1.createFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateUsdc,
                userData: ethers.utils.defaultAbiCoder.encode(["string"], ["carl"]),
                shouldUseCallAgreement: true,
                overrides,
            }).exec(aliceSigner);
            console.log("========== Alice opened a USDC stream to REXMarket ===========");

            // Bob opens a USDC stream to REXMarket
            await sf.cfaV1.createFlow({
                sender: bobSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateUsdc,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(bobSigner);
            console.log("========== Bob opened a RIC stream to REXMarket ===========");

            // Take a snapshot
            snapshot = await provider.send('evm_snapshot', []);

        });

        beforeEach(async () => {
            // Revert to the point REXMarket was just deployed
            const success = await provider.send('evm_revert', [
                snapshot
            ]);
            // Take another snapshot to be able to revert again next time
            snapshot = await provider.send('evm_snapshot', []);
            expect(success).to.equal(true);
        });

        afterEach(async () => {
            // Check the app isn't jailed
            // expect(await market.isAppJailed()).to.equal(false);
            await resetMeasurements();
        });

        after(async () => {
        });


        it("#2.1 manual distribution", async () => {

            // First try swap of RIC to USDC

            // Check balance
            await takeMeasurements();

            // Fast forward an hour and distribute
            await increaseTime(60);
            await market.distribute("0x", false);
            // Fast forward an hour and distribute
            await increaseTime(60);
            await market.distribute("0x", false);
            // Fast forward an hour and distribute
            await increaseTime(60);
            await market.distribute("0x", false);


            // Check balances again
            await takeMeasurements();

            // get the price from the oracle to use in the test
            let rexShirtOraclePrice = await market.getTwap();

            // Compute the delta
            let deltaAlice = await delta(aliceSigner, aliceBalances);
            let deltaBob = await delta(bobSigner, bobBalances);
            let deltaCarl = await delta(carlSigner, carlBalances);
            let deltaOwner = await delta(adminSigner, ownerBalances);

            // Log the exchange rate between USDC and rexSHIRT for alice and bob
            // console.log("alice rexshirt exchange rate: " + deltaAlice.usdcx / deltaAlice.rexshirt * -1);
            // console.log("bob rexshirt exchange rate: " + deltaBob.usdcx / deltaBob.rexshirt * -1);

            // // Expect Alice and Bob got the right output less the 2% fee + 2% slippage (thin market)
            expect(deltaAlice.rexshirt).to.be.above(deltaAlice.usdcx / rexShirtOraclePrice * 1e18 * -1 * 0.95)
            expect(deltaBob.rexshirt).to.be.above(deltaBob.usdcx / rexShirtOraclePrice * 1e18 * -1 * 0.95)
            
            // // Expect Owner and Carl got their fee from Alice
            let totalOutput = deltaAlice.rexshirt + deltaCarl.rexshirt + deltaBob.rexshirt + deltaOwner.rexshirt;
            expect(deltaCarl.rexshirt / totalOutput).to.within(0.00491, 0.0501)
            expect(deltaOwner.rexshirt / totalOutput).to.within(0.00149, 0.01501)

            // Update Alices stream
            await sf.cfaV1.updateFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                flowRate: inflowRateUsdc10x,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(aliceSigner);

            // Check balance
            await takeMeasurements();
            // Fast forward an hour and distribute
            await increaseTime(60);
            await market.distribute("0x", false);
            await increaseTime(60);
            await market.distribute("0x", false);
            await increaseTime(60);
            await market.distribute("0x", false);

            // Check balances again
            await takeMeasurements();

            rexShirtOraclePrice = await market.getTwap();

            // Compute the delta
            deltaAlice = await delta(aliceSigner, aliceBalances);
            deltaBob = await delta(bobSigner, bobBalances);
            deltaCarl = await delta(carlSigner, carlBalances);
            deltaOwner = await delta(adminSigner, ownerBalances);

            // Log the exchange rate between USDC and rexSHIRT for alice and bob
            // console.log("alice rexshirt exchange rate: " + deltaAlice.usdcx / deltaAlice.rexshirt * -1);
            // console.log("bob rexshirt exchange rate: " + deltaBob.usdcx / deltaBob.rexshirt * -1);

            // Expect Alice and Bob got the right output less the 2% fee + 1% slippage
            expect(deltaBob.rexshirt).to.be.above(deltaBob.usdcx / rexShirtOraclePrice * 1e18 * -1 * 0.97)
            expect(deltaAlice.rexshirt).to.be.above(deltaAlice.usdcx / rexShirtOraclePrice * 1e18 * -1 * 0.97)
            // Expect Owner and Carl got their fee from Alice
            totalOutput = deltaAlice.rexshirt + deltaCarl.rexshirt + deltaBob.rexshirt + deltaOwner.rexshirt;
            expect(deltaCarl.rexshirt / totalOutput).to.within(0.00491, 0.0501);
            expect(deltaOwner.rexshirt / totalOutput).to.within(0.001499, 0.01501);

            // Delete alice and bobs flow
            await sf.cfaV1.deleteFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(aliceSigner);
            // Delete Bob's flow
            await sf.cfaV1.deleteFlow({
                sender: bobSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(bobSigner);

            console.log("========== Alice and Bob closed their RIC streams to REXMarket ===========");
        });

    });

    context("#3 - matic supertoken market with two", async () => {

        before(async () => {
            // Deploy RIC-USDC Rex Market
            const registrationKey = await sfRegistrationKey(sf, adminSigner.address);

            market = await REXMarketFactory.deploy(
                adminSigner.address,
                sf.settings.config.hostAddress,
                config.CFA_SUPERFLUID_ADDRESS,
                config.IDA_SUPERFLUID_ADDRESS,
                registrationKey,
                referral.address,
                GELATO_OPS,
                adminSigner.address
            );
            console.log("=========== Deployed REXUniswapV3Market ============");
            await market.initializeMATIC(config.WMATIC_ADDRESS, config.MATICX_ADDRESS);
            console.log("=========== Initialized MATIC ============");
            await market.createTask();
            console.log("=========== Created Gelato Task ============");
            await market.initializeMarket(
                ricochetUSDCx.address,
                ricochetMATICx.address,
                ricochetRIC.address,
                10000,
                20000,
                "1000000000000000000", // 1 USDC/MATICx pulled the rate on Uniswap
                150,
            );
            console.log("========== Initialized market ===========");
            // Initialize the twoway market's uniswap
            // token0 is USDC, token1 is rexSHIRT (supertokens)
            await market.initializeUniswap(
                config.UNISWAP_V3_ROUTER_ADDRESS, 
                config.UNISWAP_V3_FACTORY_ADDRESS,
                [config.USDC_ADDRESS, config.WMATIC_ADDRESS],
                500
            );
            console.log("========== Initialized uniswap ===========");

            // Register the market with REXReferral
            await referral.registerApp(market.address);
            console.log("========== Registered market with REXReferral ===========");

            maticxIDAIndex = {
                token: ricochetMATICx,
                IDAIndex: 0,
            };

            ricIDAIndex = {
                token: ricochetRIC,
                IDAIndex: 1,
            };

            await approveSubscriptions([maticxIDAIndex, ricIDAIndex],
                [adminSigner, aliceSigner, bobSigner, carlSigner]);


            // Alice opens a USDC stream to REXMarket
            await sf.cfaV1.createFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateUsdc,
                userData: ethers.utils.defaultAbiCoder.encode(["string"], ["carl"]),
                shouldUseCallAgreement: true,
                overrides,
            }).exec(aliceSigner);
            console.log("========== Alice opened a USDC stream to REXMarket ===========");
            
            // Fast forward 1 minute
            await increaseTime(120);

            await sf.cfaV1.createFlow({
                sender: bobSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                flowRate: inflowRateUsdc,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(bobSigner);
            console.log("========== Bob opened a RIC stream to REXMarket ===========");


            // Take a snapshot
            snapshot = await provider.send('evm_snapshot', []);

        });

        beforeEach(async () => {
            // Revert to the point REXMarket was just deployed
            const success = await provider.send('evm_revert', [
                snapshot
            ]);
            // Take another snapshot to be able to revert again next time
            snapshot = await provider.send('evm_snapshot', []);
            expect(success).to.equal(true);
        });

        afterEach(async () => {
            await resetMeasurements();
        });
        
        after(async () => {

        });

        it("#3.1 distribution", async () => {

            // First try swap of RIC to USDC

            // Check balance
            await takeMeasurements();

            // Fast forward an hour and distribute
            await increaseTime(3600);
            await market.distribute("0x", false);
            await increaseTime(3600);
            await market.distribute("0x", false);
            await increaseTime(3600);
            await market.distribute("0x", false);
            // Check balances again
            await takeMeasurements();

            // get the price of matic from the oracle
            maticOraclePrice = await market.getTwap();

            // Compute the delta
            let deltaAlice = await delta(aliceSigner, aliceBalances);
            let deltaBob = await delta(bobSigner, bobBalances);
            let deltaCarl = await delta(carlSigner, carlBalances);
            let deltaOwner = await delta(adminSigner, ownerBalances);

            // Expect Alice and Bob got the right output less fees
            // expect(deltaBob.maticx).to.be.above(deltaBob.usdcx / maticOraclePrice * 1e18 * -1 * 0.97)
            expect(deltaAlice.maticx).to.be.above(deltaAlice.usdcx / maticOraclePrice * 1e18 * -1 * 0.97)
            // Expect Owner and Carl got their fee from Alice
            expect(deltaCarl.maticx / (deltaAlice.maticx + deltaBob.maticx + deltaCarl.maticx + deltaOwner.maticx)).to.within(0.00499, 0.00501)
            expect(deltaOwner.maticx / (deltaAlice.maticx + deltaBob.maticx + deltaCarl.maticx + deltaOwner.maticx)).to.within(0.01499, 0.01501)

            // Delete alice and bobs flow
            await sf.cfaV1.deleteFlow({
                sender: aliceSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(aliceSigner);
            // Delete Bob's flow
            await sf.cfaV1.deleteFlow({
                sender: bobSigner.address,
                receiver: market.address,
                superToken: ricochetUSDCx.address,
                shouldUseCallAgreement: true,
                overrides,
            }).exec(bobSigner);


        });

    });

});