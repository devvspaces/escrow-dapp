import { ethers } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";
import create from "./create";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function getEscrows() {
  return JSON.parse(localStorage.getItem("escrowContracts") || "[]");
}

function addEscrow(address) {
  const escrows = getEscrows();
  escrows.push({
    address,
  });

  localStorage.setItem(
    "escrowContracts",
    JSON.stringify([...new Set(escrows)])
  );
}

function createEscrow(contract, data, signer) {
  const escrow = {
    address: contract.address,
    arbiter: data.arbiter,
    beneficiary: data.beneficiary,
    value: data.balance.toString(),
    handleApprove: async () => {
      contract.on("Approved", () => {
        document.getElementById(contract.address).className = "complete";
        document.getElementById(contract.address).innerText =
          "✓ It's been approved!";
      });

      document.getElementById(contract.address).innerText = "Approving...";
      try {
        await approve(contract, signer);
      } catch (e) {
        document.getElementById(contract.address).innerText = "You are not allowed to approve this contract.";
        setTimeout(() => {
          document.getElementById(contract.address).innerText = "Approve"
        }, 2000);
      }
    },
  };
  return escrow;
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      setAccount(accounts[0]);
      setSigner(signer);

      const contracts = [];
      const escrowContracts = getEscrows();
      console.log("Loading contracts", escrowContracts);
      for (let contract of escrowContracts) {
        const {
          contract: escrowContract,
          beneficiary,
          arbiter,
          balance,
        } = await create(provider, contract.address, signer);
        const escrow = createEscrow(
          escrowContract,
          {
            arbiter,
            beneficiary,
            balance,
          },
          signer
        );
        contracts.push(escrow);
      }

      setEscrows(contracts);
    }

    getAccounts();
  }, [account]);

  async function newContract() {
    const beneficiary = document.getElementById("beneficiary").value;
    const arbiter = document.getElementById("arbiter").value;
    const value = ethers.utils.parseUnits(document.getElementById("wei").value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
  
    const escrow = createEscrow(
      escrowContract,
      {
        arbiter,
        beneficiary,
        balance: value,
      },
      signer
    );

    addEscrow(escrowContract.address);
    setEscrows([...escrows, escrow]);
  }

  async function addContract() {
    const address = document.getElementById("contractAddress").value;
    const {
      contract: escrowContract,
      beneficiary,
      arbiter,
      balance,
    } = await create(provider, address, signer);

    const escrow = createEscrow(
      escrowContract,
      {
        arbiter,
        beneficiary,
        balance,
      },
      signer
    );

    addEscrow(escrowContract.address);
    setEscrows([...escrows, escrow]);
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in Eth)
          <input type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="contract">
        <h1>Add Contract </h1>
        <label>
          Contract Address
          <input type="text" id="contractAddress" />
        </label>
        <div
          className="button"
          id="addContract"
          onClick={(e) => {
            e.preventDefault();

            addContract();
          }}
        >
          Add
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
          {escrows.length === 0 && (
            <div style={{ textAlign: "center" }}> No contracts yet </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
