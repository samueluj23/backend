const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const bs58 = require("bs58");
const transactionModel = require('../../model/transactionModel');
const Url = "https://bold-sleek-star.solana-mainnet.quiknode.pro/6b36d57823014834a80262b13f0ed5acc898240b/";
const dotenv = require("dotenv");
dotenv.config();

const tokenMintAddress = process.env.TOKEN_ADDRESS;
const senderSecretKey = process.env.PRIVATE_KEY;

const mintPublicKey = new web3.PublicKey(tokenMintAddress);
const feePayer = web3.Keypair.fromSecretKey(bs58.decode(senderSecretKey));

const connection = new web3.Connection(Url, 'recent');
exports.sendToken = async (recipientAddress, amount, txHash) => {
    try {
        const recipientPublicKey = new web3.PublicKey(recipientAddress);
        const senderTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(connection, feePayer, mintPublicKey, feePayer.publicKey);
        const recipientTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(connection, feePayer, mintPublicKey, recipientPublicKey);
        const senderTokenBalance = await connection.getTokenAccountBalance(senderTokenAccount.address);
        const receiverTokenBalance = await connection.getTokenAccountBalance(recipientTokenAccount.address);

        let adminBalance = senderTokenBalance.value.uiAmount;

        const senderAccountInfo = await connection.getAccountInfo(feePayer.publicKey);
        if (adminBalance < amount) {
            console.error("Sender does not have enough token balance");
            return false;
        }
        const fees = await connection.getMinimumBalanceForRentExemption(splToken.AccountLayout.span);
        if (senderAccountInfo.lamports < fees) {
            console.error("Sender does not have enough SOL to cover transaction fees");
            return false;
        }

        let decimals = senderTokenBalance.value.decimals;
        let sendSolTokenAmount = toFixedd(amount * 10 ** decimals);
        const blockhash = await connection.getRecentBlockhash();
        let tx = new web3.Transaction({ recentBlockhash: blockhash.blockhash }).add(
            splToken.createTransferCheckedInstruction(
                senderTokenAccount.address, // from (should be a token account)
                mintPublicKey, // mint
                recipientTokenAccount.address, // to (should be a token account)
                feePayer.publicKey, // from's owner
                sendSolTokenAmount, // amount, if your deciamls is 8, send 10^8 for 1 token
                decimals // decimals
            )
        );

        let signature = await connection.sendTransaction(tx, [
            feePayer,
            feePayer /* fee payer + owner */,
        ]);
        console.log(`txhash: ${signature}`, "sentAmount", amount, "sentAmountInString", sendSolTokenAmount, "toaddress", recipientAddress);

        await transactionModel.findOneAndUpdate({ txHash }, { status: true, tokenTxHash: signature });

    } catch (err) {
        console.error("err sendToken", err);
        return false
    }
}

const toFixedd = (x) => {
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split("e-")[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = "0." + new Array(e).join("0") + x.toString().substring(2);
        }
    } else {
        var e = parseInt(x.toString().split("+")[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += new Array(e + 1).join("0");
        }
    }
    return x;
}