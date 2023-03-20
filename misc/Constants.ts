import { REX_REFERRAL_ADDRESS } from "./setup";

export const Constants : {[key: string]: any} = {
    optimism: {
        SF_RESOLVER: "0x743B5f46BC86caF41bE4956d9275721E0531B186",
        HOST_SUPERFLUID_ADDRESS: "0x567c4B141ED61923967cA25Ef4906C8781069a10",
        IDA_SUPERFLUID_ADDRESS: "0x204C6f131bb7F258b2Ea1593f5309911d8E458eD",
        CFA_SUPERFLUID_ADDRESS: "0xc4ce5118C3B20950ee288f086cb7FC166d222D4c",

        // Tokens
        RIC_TOKEN: "0x263026E7e53DBFDce5ae55Ade22493f828922965",
        USDCX_ADDRESS: "0x8430f084b939208e2eded1584889c9a66b90562f",
        USDC_ADDRESS: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        ETHX_ADDRESS: "0x4ac8bD1bDaE47beeF2D1c6Aa62229509b962Aa0d",
        ETH_ADDRESS: "0x0000000000000000000000000000000000000000",

        // Uniswap V3
        UNISWAP_V3_ROUTER_ADDRESS: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        UNISWAP_V3_FACTORY_ADDRESS: "0x1F98431c8aD98523631AE4a59f267346ea31F984",

        // Gelato
        GELATO_OPS: "0x340759c8346A1E6Ed92035FB8B6ec57cE1D82c2c",
        GELATO_NETWORK: "0x01051113D81D7d6DA508462F2ad6d7fD96cF42Ef",

        // Polygon DAO Gnosis
        GNOSIS_SAFE_ADDRESS: "0x9C6B5FdC145912dfe6eE13A667aF3C5Eb07CbB89",
        SF_REG_KEY: "k1"

    },
    polygon: {
        SF_RESOLVER: "0xE0cc76334405EE8b39213E620587d815967af39C",
        HOST_SUPERFLUID_ADDRESS: "0x3E14dC1b13c488a8d5D310918780c983bD5982E7",
        IDA_SUPERFLUID_ADDRESS: "0xB0aABBA4B2783A72C52956CDEF62d438ecA2d7a1",
        CFA_SUPERFLUID_ADDRESS: "0x6EeE6060f715257b970700bc2656De21dEdF074C",
        SUSHISWAP_ROUTER_ADDRESS: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",

        COINGECKO_KEY: "ethereum",

        /**
         * Tokens Adresses
         */
        RIC_TOKEN_ADDRESS: "0x263026E7e53DBFDce5ae55Ade22493f828922965",
        USDCX_ADDRESS: "0xCAa7349CEA390F89641fe306D93591f87595dc1F",
        USDC_ADDRESS: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        ETHX_ADDRESS: "0x27e1e4E6BC79D93032abef01025811B7E4727e85",
        ETH_ADDRESS: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        REXSHIRT_ADDRESS: "0x19cA69C66768B487D28226C0a60Ab2B2aa8E5c5C",
        // These are the supertoken versions
        IBALLUOUSD_ADDRESS: "0xE9E759B969B991F2bFae84308385405B9Ab01541",
        IBALLUOETH_ADDRESS: "0x2D4Dc956FBd0044a4EBA945e8bbaf98a14025C2d",
        IBALLUOBTC_ADDRESS: "0x3E70E15c189e1FFe8FF44d713605528dC1701b63",

        RIC_SOURCE_ADDRESS: "0x9C6B5FdC145912dfe6eE13A667aF3C5Eb07CbB89",
        USDCX_SOURCE_ADDRESS: "0x2dbd50A4Ef9B172698596217b7DB0163D3607b41",
        ETHX_SOURCE_ADDRESS: "0x0154d25120Ed20A516fE43991702e7463c5A6F6e",
        WBTC_SOURCE_ADDRESS: "0x5c2ed810328349100A66B82b78a1791B101C9D61",
        USDC_SOURCE_ADDRESS: "0x1a13f4ca1d028320a707d99520abfefca3998b7f",
        MATICX_SOURCE_ADDRESS: "0x9751AD30F37C1d0f943aADCD1122d214c64228c3",
        IBALLUOUSD_SOURCE_ADDRESS: "0x781c9e6f0eeedfe16329880731e25fd57fe27e13",
        IBALLUOETH_SOURCE_ADDRESS: "0xabfe4d45c6381908f09ef7c501cc36e38d34c0d4",
        OUTPUT_TOKEN_ADDRESS: "0xB63E38D21B31719e6dF314D3d2c351dF0D4a9162", // IDLE

        /**
         * Users Adresses
         */
        CARL_ADDRESS: "0x8c3bf3EB2639b2326fF937D041292dA2e79aDBbf",
        BOB_ADDRESS: "0x00Ce20EC71942B41F50fF566287B811bbef46DC8",
        ALICE_ADDRESS: "0x9f348cdD00dcD61EE7917695D2157ef6af2d7b9B",
        OWNER_ADDRESS: "0x3226C9EaC0379F04Ba2b1E1e1fcD52ac26309aeA",
        REPORTER_ADDRESS: "0xeA74b2093280bD1E6ff887b8f2fE604892EBc89f",
        KAREN_ADDRESS: "0xbf188ab46C1ca9d9e47a7996d585566ECeDdAeAb",

        REX_REFERRAL_ADDRESS: "0xA0eC9E1542485700110688b3e6FbebBDf23cd901",

        // Uniswap V3
        UNISWAP_V3_ROUTER_ADDRESS: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        UNISWAP_V3_FACTORY_ADDRESS: "0x1F98431c8aD98523631AE4a59f267346ea31F984",

        // Gelato
        GELATO_OPS: "0x527a819db1eb0e34426297b03bae11F2f8B3A19E",
        GELATO_NETWORK: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",

        // Polygon DAO Gnosis
        GNOSIS_SAFE_ADDRESS: "0x9C6B5FdC145912dfe6eE13A667aF3C5Eb07CbB89",
        SF_REG_KEY: "k1",

        // Tenderly deploy rexMaticX
        REXMATICX_ADDRESS: "0x5E31D5BDd6c87EDff8659d9eAd9Ce0013fb47184",
        MATICX_ADDRESS: "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6",

        // Deployment constants for UniswapV3 market
        SHARE_SCALER: 10000,
        FEE_RATE: 5000,
        INITIAL_PRICE: '1550000000000000000000',
        RATE_TOLERANCE: 20000,
        UNISWAP_POOL_FEE: 3000,

    },
    // Infura network name for Mumbai
    maticmum: {
        SF_RESOLVER: "0x8C54C83FbDe3C59e59dd6E324531FB93d4F504d3",
        HOST_SUPERFLUID_ADDRESS: "0xEB796bdb90fFA0f28255275e16936D25d3418603",
        IDA_SUPERFLUID_ADDRESS: "0x804348D4960a61f2d5F9ce9103027A3E849E09b8",
        CFA_SUPERFLUID_ADDRESS: "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873",

        // Tokens
        RIC_ADDRESS: "0xDCf9273075A29F0070d5cB4632814367CE4350aE", // Deployed on Mumbai
        USDCX_ADDRESS: "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7",
        USDC_ADDRESS: "0xbe49ac1EadAc65dccf204D4Df81d650B50122aB2",
        DAIX_ADDRESS: "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f", // fDAIx on mumbai
        DAI_ADDRESS: "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7", // fDAI on mumbai

        // Uniswap V3
        UNISWAP_V3_ROUTER_ADDRESS: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        UNISWAP_V3_FACTORY_ADDRESS: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        UNISWAP_POOL_FEE: 500,

        // Deployment constants for UniswapV3 market
        REX_DEPLOYER_ADDRESS: "0x3226C9EaC0379F04Ba2b1E1e1fcD52ac26309aeA",
        SHARE_SCALER: 10000,
        FEE_RATE: 5000,
        INITIAL_PRICE: '1000000000000000000',
        RATE_TOLERANCE: 20000,

        // Gelato
        GELATO_OPS: "0xB3f5503f93d5Ef84b06993a1975B9D21B962892F",
        GELATO_NETWORK: "0x25aD59adbe00C2d80c86d01e2E05e1294DA84823",

        // Polygon DAO Gnosis
        DAO_ADDRESS: "0x9d7254F07b4De4643B409B5971eE2888E279417F", // Metamask Wallet, no Gnosis on Mumbai
        SF_REG_KEY: "",
        REX_REFERRAL_ADDRESS: "0x24239b083143759C8920Ba56d76Be36CD70DE490", // Deployed on Mumbai
    }
} as const;
