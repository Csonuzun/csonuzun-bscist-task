import { ethers } from "ethers";
let reserve0 = ethers.BigNumber.from("33333333333333333670")
let reserve1 = ethers.BigNumber.from("81024307292187657300")
const _amount0 = ethers.BigNumber.from("1000000000000000000")
function numDigits(number){
    return Math.log(number) * Math.LOG10E + 1 | 0;
}

const D =  10 ** (numDigits(_amount0))

console.log(D)