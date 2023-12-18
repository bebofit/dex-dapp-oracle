const express = require("express");
const axios = require("axios");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/tokenPrice", async (req, res) => {
  const { query } = req;

  const responseOne = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressOne,
  });

  const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressTwo,
  });

  const usdPrices = {
    tokenOne: responseOne.raw.usdPrice,
    tokenTwo: responseTwo.raw.usdPrice,
    ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice,
  };

  return res.status(200).json(usdPrices);
});

app.get("/allowance", async (req, res) => {
  const { query } = req;

  const allowance = await axios.get(
    `${process.env.ONEINCH_URL}/${process.env.CHAIN_ID}/approve/allowance?tokenAddress=${query.tokenAddress}&walletAddress=${query.walletAddress}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_APIKEY}`,
      },
    }
  );
  console.log(allowance.data);
  return res.status(200).json(allowance.data);
});

app.get("/transaction", async (req, res) => {
  await new Promise((r) => setTimeout(r, 2000));

  const { query } = req;

  const approve = await axios.get(
    `${process.env.ONEINCH_URL}/${process.env.CHAIN_ID}/approve/transaction?tokenAddress=${query.tokenAddress}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_APIKEY}`,
      },
    }
  );
  console.log(approve.data);
  return res.status(200).json(approve.data);
});

app.get("/swap", async (req, res) => {
  await new Promise((r) => setTimeout(r, 2000));
  const { query } = req;

  const tx = await axios.get(
    `${process.env.ONEINCH_URL}/${process.env.CHAIN_ID}/swap?fromTokenAddress=${query.tokenOneAddress}&toTokenAddress=${query.tokenTwoAddress}&amount=${query.amount}&fromAddress=${query.walletAddress}&slippage=${query.slippage}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_APIKEY}`,
      },
    }
  );

  console.log(tx.data);
  return res.status(200).json(tx.data);
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls on port ${port}`);
  });
});
