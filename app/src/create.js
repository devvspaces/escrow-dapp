import { ethers } from 'ethers';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';

export default async function create(provider, address, signer) {
  const contract = new ethers.Contract(
    address,
    Escrow.abi,
    signer
  );
  const beneficiary = await contract.beneficiary();
  const arbiter = await contract.arbiter();
  return {
    contract,
    arbiter,
    beneficiary,
    balance: await provider.getBalance(address),
  }
}
