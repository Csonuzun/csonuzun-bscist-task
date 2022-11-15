import React from "react";
import web3 from "./web3";
import FurkanToken from "./FurkanToken";
import FurkanStable from "./FurkanStable";
import lottery from "./lottery";
import CSONUZUAMM from "./CSONUZUAMM";

const amm_address = "0x55B24fD7D1458a7eCA3526Dc3A01A7bb96423F4f"

class App extends React.Component {
    state = {
        manager: "",
        players: [],
        balance: "",
        value: "",
        message: "",
        FTKNvalue: undefined,
        FUSDvalue: undefined

    };

    async componentDidMount() {
        const accounts = await web3.eth.getAccounts();

        const FurkanTokenName = await FurkanToken.methods.name().call();
        const FurkanTokenTotalSupply = await FurkanToken.methods.totalSupply().call() / 10 ** 18;
        const FurkanTokenSymbol = await FurkanToken.methods.symbol().call();
        const FurkanToken_allowance = await FurkanToken.methods.allowance(accounts[0], amm_address).call()

        const FurkanStableName = await FurkanStable.methods.name().call();
        const FurkanStableTotalSupply = await FurkanStable.methods.totalSupply().call() / 10 ** 18;
        const FurkanStableSymbol = await FurkanStable.methods.symbol().call();
        const FurkanStable_allowance = await FurkanStable.methods.allowance(accounts[0], amm_address).call()

        this.setState({
            FurkanTokenName, FurkanTokenTotalSupply, FurkanTokenSymbol, FurkanToken_allowance,
            FurkanStable_allowance, FurkanStableName, FurkanStableTotalSupply, FurkanStableSymbol
        });
    }

    onSubmitFTKN = async (event) => {
        event.preventDefault();

        const accounts = await web3.eth.getAccounts();

        this.setState({message: "Waiting on transaction success..."});

        await FurkanToken.methods.approve(amm_address, this.state.value).send({
            from: accounts[0]
        });

        this.setState({message: "Approved!"});
    };

    onSubmitFUSD = async (event) => {
        event.preventDefault();

        const accounts = await web3.eth.getAccounts();

        this.setState({message: "Waiting on transaction success..."});

        await FurkanStable.methods.approve(amm_address, this.state.value).send({
            from: accounts[0]
        });

        this.setState({message: "Approved!"});
    };

    onSubmitAddLiquidity = async (event) => {
        event.preventDefault();

        const accounts = await web3.eth.getAccounts();

        this.setState({message: "Waiting on transaction success..."});

        await CSONUZUAMM.methods.addLiquidity(this.state.FTKNvalue, this.state.FUSDvalue).send({
            from: accounts[0]
        });

        this.setState({message: "Liquidity Added Succesfully!"});
    };

    onClick = async () => {
        const accounts = await web3.eth.getAccounts();

        this.setState({message: "Waiting on transaction success..."});

        await lottery.methods.pickWinner().send({
            from: accounts[0],
        });

        this.setState({message: "A winner has been picked!"});
    };

    render() {
        return (
            <div>
                <h2>CSONUZUN AMM Contract</h2>
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
                    <div>
                        <label>Amount of token to approve </label>
                        <input
                            value={this.state.value}
                            onChange={(event) => this.setState({value: event.target.value})}
                        />
                    </div>
                    <button>Approve FTKN</button>
                </form>

                <form onSubmit={this.onSubmitFUSD}>
                    <h4>Approve FUSD</h4>
                    <div>
                        <label>Amount of token to approve </label>
                        <input
                            value={this.state.value}
                            onChange={(event) => this.setState({value: event.target.value})}
                        />
                    </div>
                    <button>Approve FUSD</button>
                </form>

                <form onSubmit={this.onSubmitAddLiquidity}>
                    <h4>ADD LIQUIDITY</h4>
                    <div>
                        <label>FTKN </label>
                        <input
                            value={this.state.FTKNvalue}
                            onChange={(event) => this.setState({FTKNvalue: event.target.value})}
                        />
                        <label>FUSD </label>
                        <input
                            value={this.state.FUSDvalue}
                            onChange={(event) => this.setState({FUSDvalue: event.target.value})}
                            />
                    </div>
                    <button>ADD LIQUIDTY</button>
                </form>

                <hr/>

                <h4>Ready to pick a winner?</h4>
                <button onClick={this.onClick}>Pick a winner!</button>

                <hr/>

                <h1>{this.state.message}</h1>
            </div>
        );
    }
}

export default App;
