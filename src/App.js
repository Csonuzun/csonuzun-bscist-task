import React from "react"
import web3 from "./web3"
import FurkanToken from "./FurkanToken"
import FurkanStable from "./FurkanStable"
import CSONUZUAMM from "./CSONUZUAMM"
import StakingRewards from "./StakingRewards"
import {ethers} from "ethers"

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
        swapAmount: undefined,
        stakeAmount: undefined
    }

    async componentDidMount() {
        const accounts = await web3.eth.getAccounts()

        const furkanTokenName = await FurkanToken.methods.name().call()
        const furkanTokenTotalSupply = await FurkanToken.methods.totalSupply().call() / 10 ** decimals
        const furkanTokenSymbol = await FurkanToken.methods.symbol().call()
        const furkanTokenAllowance = await FurkanToken.methods.allowance(accounts[0], CSONUZUAMM._address).call() / 10 ** decimals

        const furkanStableName = await FurkanStable.methods.name().call()
        const furkanStableTotalSupply = await FurkanStable.methods.totalSupply().call() / 10 ** decimals
        const furkanStableSymbol = await FurkanStable.methods.symbol().call()
        const furkanStableAllowance = await FurkanStable.methods.allowance(accounts[0], CSONUZUAMM._address).call() / 10 ** decimals

        const totalLiquidity = await CSONUZUAMM.methods.totalSupply().call() / 10 ** decimals
        const accountLiquidity = await CSONUZUAMM.methods.balanceOf(accounts[0]).call() / 10 ** decimals
        const reserve0 = ethers.BigNumber.from(await CSONUZUAMM.methods.reserve0().call()) //fusd
        const reserve1 = ethers.BigNumber.from(await CSONUZUAMM.methods.reserve1().call()) //ftkn
        const rate = await CSONUZUAMM.methods.reserve0().call() / await CSONUZUAMM.methods.reserve1().call()

        const staked = await StakingRewards.methods.balanceOf(accounts[0]).call()
        const earnedReward = await StakingRewards.methods.earned(accounts[0]).call() / 10 ** decimals
        console.log("fusd reserve: ", reserve0.toString())
        console.log("ftkn reserve: ", reserve1.toString())

        this.setState({
            totalLiquidity: totalLiquidity,
            accountLiquidity,
            reserve0,
            reserve1,
            rate,
            staked,
            earnedReward,
            FurkanTokenName: furkanTokenName,
            FurkanTokenTotalSupply: furkanTokenTotalSupply,
            FurkanTokenSymbol: furkanTokenSymbol,
            FurkanTokenAllowance: furkanTokenAllowance,
            FurkanStableAllowance: furkanStableAllowance,
            FurkanStableName: furkanStableName,
            FurkanStableTotalSupply: furkanStableTotalSupply,
            FurkanStableSymbol: furkanStableSymbol
        })
    }

    //AMM Functions
    onSubmitApproveAmmFtkn = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        this.setState({message: "Waiting on transaction to uccess..."})
        const FurkanTokenTotalSupply = await FurkanToken.methods.totalSupply().call()

        await FurkanToken.methods.approve(CSONUZUAMM._address, FurkanTokenTotalSupply).send({
            from: accounts[0]
        })
        this.setState({message: "Approved!"})
    }

    onSubmitApproveAmmFusd = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        this.setState({message: "Waiting on transaction to success..."})
        const FurkanStableTotalSupply = await FurkanToken.methods.totalSupply().call()
        await FurkanStable.methods.approve(CSONUZUAMM._address, FurkanStableTotalSupply).send({
            from: accounts[0]
        })
        this.setState({message: "Approved!"})
    }

    onSubmitSwap = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        this.setState({message: "Waiting on transaction to success..."})
        this.setSelectedToken()
        let tokenInAddress = 0
        if (this.state.swapTokenInput === 'FUSD') {
            tokenInAddress = FurkanStable._address
        } else {
            tokenInAddress = FurkanToken._address
        }
        await CSONUZUAMM.methods.swap(tokenInAddress, ethers.utils.parseUnits(this.state.swapAmount, decimals)).send({
            from: accounts[0]
        })
        this.setState({message: "Swap Succesful"})

    }

    onSubmitAddLiquidity = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        const dx = ethers.utils.parseUnits(this.state.fusdInput.toString(), decimals)
        const X = this.state.reserve0
        const Y = this.state.reserve1
        const dy = Y.mul(dx).div(X)
        this.setState({message: "Waiting on transaction to success..."})
        await CSONUZUAMM.methods.addLiquidity(dx, dy, 100).send({
            from: accounts[0]
        })
        this.setState({message: "Liquidity Added Succesfully!"})

    }

    onSubmitRemoveLiquidity = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        this.setState({message: "Waiting on transaction to success..."})
        await CSONUZUAMM.methods.removeLiquidity(ethers.utils.parseUnits(this.state.removeLiquidityInput, decimals).toString()).send({
            from: accounts[0]
        })
        this.setState({message: this.state.removeLiquidityInput + " Shares Removed Succesfully!"})
    }

    onSubmitRemoveLiquidityAll = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        await CSONUZUAMM.methods.removeLiquidity(await CSONUZUAMM.methods.balanceOf(accounts[0]).call()).send({
            from: accounts[0]
        })
    }

    //Staking Functions
    onSubmitApproveStakeFTKN = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        this.setState({message: "Waiting on transaction to success..."})
        const FurkanStableTotalSupply = await FurkanToken.methods.totalSupply().call()
        await FurkanToken.methods.approve(StakingRewards._address, FurkanStableTotalSupply).send({
            from: accounts[0]
        })
        this.setState({message: "Approved!"})
    }

    onSubmitStake = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        this.setState({message: "Waiting on transaction to success..."})
        await StakingRewards.methods.stake(ethers.utils.parseUnits(this.state.stakeAmount, decimals)).send({
            from: accounts[0]
        })
        this.setState({message: "Stake Succesful"})

    }

    onSubmitGetReward = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        this.setState({message: "Waiting on transaction to success..."})
        await StakingRewards.methods.getReward().send({
            from: accounts[0]
        })
        this.setState({message: "Reward Collection Succesful"})
    }

    onSubmitUnstake = async (event) => {
        event.preventDefault()
        const accounts = await web3.eth.getAccounts()
        this.setState({message: "Waiting on transaction to success..."})
        await StakingRewards.methods.withdraw(this.state.withdrawAmount).send({
            from: accounts[0]
        })
        this.setState({message: "Reward Collection Succesful"})
    }

    //utils
    setSelectedToken = (event) => {
        const d = document.getElementById("swapTokenInput")
        const swapToken = d.options[d.selectedIndex].text
        this.setState({swapTokenInput: swapToken})
    }

    render() {
        return (<div>
                <h1>CSONUZUN AMM Contract</h1>
                <form onSubmit={this.onSubmitApproveAmmFtkn}>
                    <h4>Approve FTKN </h4>
                    <button>Approve FTKN</button>
                </form>

                <form onSubmit={this.onSubmitApproveAmmFusd}>
                    <h4>Approve FUSD </h4>
                    <button>Approve FUSD</button>
                </form>

                <form onSubmit={this.onSubmitAddLiquidity}>
                    <h4>ADD LIQUIDITY</h4>
                    <div>
                        <label>FUSD </label>
                        <input
                            value={this.state.fusdInput}
                            onChange={(event) => this.setState({fusdInput: event.target.value})}
                        />

                    </div>
                    <button>ADD LIQUIDTY</button>
                </form>

                <form onSubmit={this.onSubmitRemoveLiquidity}>
                    <h4>Remove Liquidity</h4>
                    <p>Your share: {this.state.accountLiquidity}</p>
                    <input
                        value={this.state.removeLiquidityInput}
                        onChange={(event) => this.setState({removeLiquidityInput: event.target.value})}
                    />
                    <button>Remove</button>
                </form>

                <form onSubmit={this.onSubmitRemoveLiquidityAll}>
                    <h4>Remove All Liquidity</h4>
                    <p>Your share: {this.state.accountLiquidity}</p>
                    <button>Remove</button>
                </form>
                <hr/>
                <h2>SWAP</h2>
                <p>1 FTKN = {this.state.rate} FUSD</p>
                <p>1 FUSD = {1 / this.state.rate} FTKN</p>
                <form onSubmit={this.onSubmitSwap}>
                    <label htmlFor="Tokens">Choose a token: </label>
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

                <h2>STAKING</h2>
                <form onSubmit={this.onSubmitApproveStakeFTKN}>
                    <h4>Approve FTKN Stake</h4>
                    <button>Approve</button>
                </form>
                <p>You Staked: {this.state.staked}</p>
                <form onSubmit={this.onSubmitStake}>
                    <div>
                        <label>STAKE FTKN </label>
                        <input
                            value={this.state.stakeAmount}
                            onChange={(event) => this.setState({stakeAmount: event.target.value})}
                        />
                    </div>
                    <button>STAKE</button>
                </form>
                <form onSubmit={this.onSubmitUnstake}>
                    <div>
                        <label>UNSTAKE FTKN </label>
                        <input
                            value={this.state.withdrawAmount}
                            onChange={(event) => this.setState({withdrawAmount: event.target.value})}
                        />
                    </div>
                    <button>UNSTAKE</button>
                </form>

                <p>You Earned: {this.state.earnedReward}</p>
                <form onSubmit={this.onSubmitGetReward}>
                    <h4>Collect Your Reward</h4>
                    <button>Collect</button>
                </form>

                <h1>{this.state.message}</h1>

            </div>

        )
    }
}

export default App
