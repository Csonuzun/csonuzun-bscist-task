import React from "react";
import web3 from "./web3";
import FurkanToken from "./FurkanToken";
import FurkanStable from "./FurkanStable";
import CSONUZUAMM from "./CSONUZUAMM";
import { ethers } from "ethers";

const decimals = 18

class App extends React.Component {
    state = {
        manager: "",
        players: [],
        balance: "",
        value: "",
        message: "",
        ftknInput: undefined,
        fusdInput: undefined,
        removeLiquidityInput: undefined,
        swapTokenInput: undefined,
        swapAmount: undefined

    };

    async componentDidMount() {
        const accounts = await web3.eth.getAccounts();

        const FurkanTokenName = await FurkanToken.methods.name().call();
        const FurkanTokenTotalSupply = await FurkanToken.methods.totalSupply().call() / 10 ** 18;
        const FurkanTokenSymbol = await FurkanToken.methods.symbol().call();
        const FurkanToken_allowance = await FurkanToken.methods.allowance(accounts[0], CSONUZUAMM._address).call() / 10 ** 18;

        const FurkanStableName = await FurkanStable.methods.name().call();
        const FurkanStableTotalSupply = await FurkanStable.methods.totalSupply().call() / 10 ** 18;
        const FurkanStableSymbol = await FurkanStable.methods.symbol().call();
        const FurkanStable_allowance = await FurkanStable.methods.allowance(accounts[0], CSONUZUAMM._address).call() / 10 ** 18;

        const total_liquidity = await CSONUZUAMM.methods.totalSupply().call() / 10 ** 18;
        const accountLiquidity = await CSONUZUAMM.methods.balanceOf(accounts[0]).call() / 10 ** 18;
        const reserve0 = ethers.BigNumber.from(await CSONUZUAMM.methods.reserve0().call()); //fusd
        const reserve1 = ethers.BigNumber.from(await CSONUZUAMM.methods.reserve1().call()); //ftkn
        console.log("fusd reserve: ", reserve0.toString())
        console.log("ftkn reserve: ", reserve1.toString())
        const rate = reserve0.div(reserve1).toString();
        this.setState({total_liquidity, accountLiquidity, reserve0, reserve1, rate,
            FurkanTokenName, FurkanTokenTotalSupply, FurkanTokenSymbol, FurkanToken_allowance,
            FurkanStable_allowance, FurkanStableName, FurkanStableTotalSupply, FurkanStableSymbol
        });
    }

    onSubmitFTKN = async (event) => {
        event.preventDefault();

        const accounts = await web3.eth.getAccounts();

        this.setState({message: "Waiting on transaction success..."});
        const FurkanTokenTotalSupply = await FurkanToken.methods.totalSupply().call();

        await FurkanToken.methods.approve(CSONUZUAMM._address, FurkanTokenTotalSupply).send({
            from: accounts[0]
        });

        this.setState({message: "Approved!"});
    };

    onSubmitFUSD = async (event) => {
        event.preventDefault();

        const accounts = await web3.eth.getAccounts();

        this.setState({message: "Waiting on transaction success..."});
        const FurkanStableTotalSupply = await FurkanToken.methods.totalSupply().call();
        console.log(FurkanStableTotalSupply)
        await FurkanStable.methods.approve(CSONUZUAMM._address, FurkanStableTotalSupply).send({
            from: accounts[0]
        });

        this.setState({message: "Approved!"});
    };

    onSubmitAddLiquidity = async (event) => {
        event.preventDefault();
        const accounts = await web3.eth.getAccounts();
        const dx = ethers.utils.parseUnits(this.state.fusdInput.toString(), decimals)
        const X = ethers.utils.parseUnits(this.state.reserve0.toString(), decimals)
        const Y = ethers.utils.parseUnits(this.state.reserve1.toString(), decimals)

        const dy = Y.mul(dx).div(X)
        console.log(dy.toString())
        console.log(X * dy === Y * dx)
        this.setState({message: "Waiting on transaction success..."});
        if(this.state.reserve0 !== 0 || this.state.reserve1 !== 0) {

            await CSONUZUAMM.methods.addLiquidity(dx, dy).send({
                from: accounts[0]
            });

        }
        else{
            await CSONUZUAMM.methods.addLiquidity(
                ethers.utils.parseUnits(this.state.fusdInput.toString(), decimals),
                ethers.utils.parseUnits(this.state.ftknInput.toString(), decimals))

        }


        this.setState({message: "Liquidity Added Succesfully!"});
    }

    onSubmitRemoveLiquidity = async (event) => {
        event.preventDefault();

        const accounts = await web3.eth.getAccounts();

        this.setState({message: "Waiting on transaction success..."});
        console.log("in:" , this.state.removeLiquidityInput)
        await CSONUZUAMM.methods.removeLiquidity(ethers.utils.parseUnits(this.state.removeLiquidityInput, decimals).toString()).send({
            from: accounts[0]
        });

        this.setState({message: this.state.removeLiquidityInput + " Shares Removed Succesfully!"});
    }

    onSubmitRemoveLiquidityAll = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts();

        await CSONUZUAMM.methods.removeLiquidity(await CSONUZUAMM.methods.balanceOf(accounts[0]).call()).send({
            from: accounts[0]
        });
    }


    onSubmitSwap = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts();
        this.setState({message: "Waiting on transaction success..."});
        this.setSelectedToken();
        let tokenInAddress = 0;
        if (this.state.swapTokenInput === 'FUSD'){
            tokenInAddress = FurkanStable._address
        }
        else {
            tokenInAddress = FurkanToken._address
        }
        await CSONUZUAMM.methods.swap(tokenInAddress, this.state.swapAmount + "000000000000000000").send({
            from: accounts[0]
        });
        this.setState({message: "Swap Succesful"});

    }

    setSelectedToken = (event) => {
        const d = document.getElementById("swapTokenInput");
        const swapToken = d.options[d.selectedIndex].text;
        this.setState({swapTokenInput: swapToken});
    }

    test = (event) => {
        event.preventDefault();
        this.setSelectedToken();
        let tokenInAddress = 0;
        if (this.state.swapTokenInput === 'FUSD'){
            tokenInAddress = FurkanStable._address
        }
        else {
            tokenInAddress = FurkanToken._address
        }
        console.log(tokenInAddress)
        console.log(this.state.swapAmount)
    }


    render() {
        return (
            <div>
                <h2>CSONUZUN AMM Contract</h2>
                <h3>Total Liquidity: {this.state.total_liquidity}</h3>
                <p>
                    Token Name: {this.state.FurkanTokenName}
                </p>
                <p>Token Symbol:
                    {this.state.FurkanTokenSymbol}
                </p>
                <p>
                    Total Supply: {this.state.FurkanTokenTotalSupply}
                </p>
                <p>
                    Allowance: {this.state.FurkanToken_allowance}
                </p>
                <h2>--------------</h2>
                <p>
                    Token Name: {this.state.FurkanStableName}
                </p>
                <p>Token Symbol:
                    {this.state.FurkanStableSymbol}
                </p>
                <p>
                    Total Supply: {this.state.FurkanStableTotalSupply}
                </p>
                <p>
                    Allowance: {this.state.FurkanStable_allowance}
                </p>


                <hr/>
                <form onSubmit={this.onSubmitFTKN}>
                    <h4>Approve FTKN</h4>
                    <button>Approve FTKN</button>
                </form>

                <form onSubmit={this.onSubmitFUSD}>
                    <h4>Approve FUSD</h4>
                    <button>Approve FUSD</button>
                </form>

                <form onSubmit={this.onSubmitAddLiquidity}>
                    <h4>ADD LIQUIDITY</h4>
                    <div>
                        <label>FUSD </label>
                        <input
                            value={this.state.fusdInput}
                            onChange={(event) =>
                                this.setState({fusdInput: event.target.value})
                                }
                        />

                    </div>
                    <button>ADD LIQUIDTY</button>
                </form>

                <form onSubmit={this.onSubmitRemoveLiquidity}>
                    <h4>Remove Liquidity</h4>
                    <p>Your share: {this.state.accountLiquidity}</p>
                    <input
                        value={this.state.removeLiquidityInput}
                        onChange={(event) =>
                            this.setState({removeLiquidityInput: event.target.value})}
                    />
                    <button>Remove</button>
                </form>

                <form onSubmit={this.onSubmitRemoveLiquidityAll}>
                    <h4>Remove All Liquidity</h4>
                    <p>Your share: {this.state.accountLiquidity}</p>
                    <button>Remove</button>
                </form>

                <hr/>

                <hr/>

                <h2>SWAP</h2>
                <h1>Rate = {this.state.rate}</h1>
                <form onSubmit={this.onSubmitSwap}>
                    <label htmlFor="Tokens">Choose a token:</label>
                    <select id="swapTokenInput" name="token">
                        <option value="FUSD">FUSD</option>
                        <option value="FTKN">FTKN</option>
                    </select>
                    <input
                        value={this.state.swapAmount}
                        onChange={(event) => this.setState({swapAmount: event.target.value})}
                    />
                    <button>Submit</button>
                </form>

                <h1>{this.state.message}</h1>

            </div>

        );
    }
}

export default App;
