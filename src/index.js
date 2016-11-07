// main entrypoint
import Keystore from './keystore';
import Balances from './balances';
import Web3 from './web3';
import Contracts from './contracts';

export default function Sigmate(opts = {}) {
  // get correct web3 instance
  const web3 = opts.web3 || opts.deployer && opts.deployer.known_contracts[Object.keys(opts.deployer.known_contracts)[0]].web3;
  // initialize accounts
  return new Keystore({ ...opts, web3 })
  .then((res) => {
    // skip if fundAccounts not set
    if (!opts.prefund) { return res; }
    // transfer the balances
    return new Balances({ ...opts, ...res, web3 });
  })
  .then((res) => {
    const newWeb3 = new Web3({ ...res, web3 });
    // get correct contracts
    const passedContracts = opts.contracts || opts.deployer && opts.deployer.known_contracts;
    const contracts = new Contracts({ ...res, contracts: passedContracts });
    // decorate deployer with new contracts
    const deployer = opts.deployer;
    if (deployer) {
      deployer.known_contracts = contracts;
    }
    const { keystore, accounts } = res;
    return { web3: newWeb3, keystore, accounts, contracts, deployer };
  });
}
