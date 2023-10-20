import { ethers } from "ethers";

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  handleApprove,
}) {
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Contract Address </div>
          <div> {address} </div>
        </li>
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div>
            <div> Value </div>
            <div className="amount">{value} Wei</div>
          </div>
          <div>
            <div> Currency </div>
            <div>
              <select onChange={(e) => {
                const el = e.target.parentElement.parentElement.previousElementSibling.lastChild;
                let val = el.innerText.split(" ")[0]
                if (e.target.value === 'eth') {
                  el.innerText = `${ethers.utils.formatEther(val)} ETH`
                } else {
                  el.innerText = `${ethers.utils.parseUnits(val, "ether")} WEI`;
                }
              }} defaultValue={'wei'}>
                <option value={'wei'}>Wei</option>
                <option value={'eth'}>Ether</option>
              </select>
            </div>
          </div>
        </li>
        <div
          className="button"
          id={address}
          onClick={(e) => {
            e.preventDefault();
            handleApprove();
          }}
        >
          Approve
        </div>
      </ul>
    </div>
  );
}
