import { ethers } from 'ethers';
import sample from "lodash/sample";
import fs from 'fs'

const bip39 = require('bip39')
const HDWallet = require('ethereum-hdwallet');

const getNodeUrl = () => {
    return sample([
        "https://bsc-dataseed1.defibit.io",
        // "https://bsc-dataseed.binance.org",
        "https://bsc-dataseed4.ninicoin.io",
        "https://bsc-dataseed2.defibit.io",
    ]) as string;
  };
const getNodeUrlEth = () => {
    return sample([
        "https://cloudflare-eth.com",
        "https://rpc.builder0x69.io",
        "https://singapore.rpc.blxrbdn.com",
        "https://eth-rpc.gateway.pokt.network"
    ]) as string;
  };

//生成英文助记词
// const mnemonic = bip39.generateMnemonic(128, null, bip39.wordlists.chinese_simplified); //生成中文助记词
 


async function getAddress(mnemonic: string) {
    
    const [rpc, rpc1] = [getNodeUrl(), getNodeUrlEth()]
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const provider1 = new ethers.providers.JsonRpcProvider(rpc1);
    const seed = await bip39.mnemonicToSeed(mnemonic); //生成种子
 
    // console.log(provider, 'provider')
    const hdwallet = HDWallet.fromSeed(seed);
 
    for (var i = 0; i < 3; i++) { // 用同一个种子生成多个地址
 
        console.log('=============地址' + (i + 1) + '=================')
    
        const key = hdwallet.derive("m/44'/60'/0'/0/" + i); // 地址路径的最后一位设置为循环变量
        // console.log("PrivateKey = " + key.getPrivateKey().toString('hex')); // 私钥
        // console.log("PublicKey = " + key.getPublicKey().toString('hex')); // 公钥
        const EthAddress = '0x' + key.getAddress().toString('hex'); //地址
        console.log('ETH Address = ' + EthAddress);
        const balance = await provider.getBalance(EthAddress);
        const balance1 = await provider1.getBalance(EthAddress);

        console.log('balance', balance)
        if (!balance1.isZero()) {
            fs.readFile('./address.json', 'utf8', (_error, _data) => {
                if (_error) {
                    console.log("读取文件失败！");
                    return
                }
                const data = JSON.parse(_data);

                fs.writeFile(
                    "./address.json",
                    JSON.stringify(data.concat({
                        mnemonic,
                        PrivateKey: key.getPrivateKey().toString('hex'),
                        PublicKey: key.getPublicKey().toString('hex'),
                        EthAddress,
                        rpc: rpc1,
                        balance: balance.toString(),
                    }), null, 2),
                    (error) => {
                    if (error) {
                        console.log("address.json文件错误！");
                    }
                    console.log("address.json文件成功！");
                    }
                );
            })
            
        }
        if (!balance.isZero()) {
            fs.readFile('./address.json', 'utf8', (_error, _data) => {
                if (_error) {
                    console.log("读取文件失败！");
                    return
                }
                const data = JSON.parse(_data);

                fs.writeFile(
                    "./address.json",
                    JSON.stringify(data.concat({
                        mnemonic,
                        PrivateKey: key.getPrivateKey().toString('hex'),
                        PublicKey: key.getPublicKey().toString('hex'),
                        EthAddress,
                        rpc,
                        balance: balance.toString(),
                    }), null, 2),
                    (error) => {
                    if (error) {
                        console.log("address.json文件错误！");
                    }
                    console.log("address.json文件成功！");
                    }
                );
            })
            
        }
        
    }
}
 
let count = 0;
const generateMnemonic = async () => {
    count ++;
    const mnemonic = bip39.generateMnemonic(); 
    console.log(`第${count}个助记词++++++++++++++++++++++++++++：` + mnemonic); //生成助记词
    if (count >= 100000) return
    try {
        await getAddress(mnemonic); //执行函数
        await generateMnemonic()
    } catch (error) {
        await generateMnemonic()
    }
}

generateMnemonic()
generateMnemonic()
generateMnemonic()
generateMnemonic()
generateMnemonic()
