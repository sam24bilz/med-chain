# 🩺 MedChain — Web3 Doctor Consultation DApp

**MedChain** is a decentralized healthcare consultation platform built on **Hedera Hashgraph**, where patients can book appointments, pay for consultations, and receive **NFT-based consultation passes** as proof of payment — all verified on-chain using **Mirror Node**.  
Payments and NFT transactions are processed securely through **HashPack Wallet**.

---

## 🌐 Live Demo
> Coming soon... (Deploy easily on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/))

---

## ✨ Features

### 🔐 User Authentication
- Secure sign-up and login for **patients** and **doctors**
- Role-based dashboards
- Web3 wallet authentication via **HashPack**

### 🪙 NFT Consultation Pass
- Each consultation generates a unique **NFT token** minted via the **Hedera Token Service (HTS)**
- NFT acts as proof of payment and grants access to the booked doctor
- Metadata includes:
  - Doctor name
  - Appointment date/time
  - Patient wallet address
  - Token ID and transaction hash

### ⚖️ Smart Contract Integration
- Solidity-based contract deployed on **Hedera Smart Contract Service**
- Validates NFT ownership and releases payment to doctor
- Prevents reuse or transfer of consultation NFTs

### 🧾 Transparent Transactions
- All consultation payments and NFT mints are verified through **Hedera Mirror Node**
- Mirror Node APIs provide:
  - Real-time transaction tracking
  - NFT mint and transfer logs

### 💼 Doctor & Patient Dashboards
- Doctors: View appointments, NFT payments, and earnings
- Patients: Book consultations, pay with wallet, and access NFT history

---

## 🧩 System Architecture

Frontend (React + TypeScript + TailwindCSS)
│
├── HashPack Wallet (hashconnect)
│ └── User wallet authentication + payments
│
├── Backend (Node.js + Express)
│ ├── User management
│ ├── Appointment handling
│ ├── NFT minting via Hedera REST API
│ ├── Smart contract interactions
│
├── Hedera Token Service (HTS)
│ └── Mint NFTs as consultation passes
│
├── Hedera Smart Contract Service
│ └── Validate NFT and payment logic
│
└── Mirror Node API
└── Verify transactions and NFT history

yaml
Copy code

---

## ⚙️ Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React, TypeScript, TailwindCSS, Framer Motion |
| **Blockchain** | Hedera Token Service + Smart Contracts |
| **Web3 Wallet** | HashPack (`hashconnect`) |
| **Backend** | Node.js, Express |
| **Database** | MongoDB or Supabase |
| **Storage** | IPFS for NFT metadata |
| **APIs** | Hedera REST API + Mirror Node API |

---

## 🔗 Core Integrations

| Service | Endpoint | Description |
|----------|-----------|-------------|
| **Hedera REST API** | `/api/v1/tokens` | Mint NFT consultation passes |
| **Hedera Smart Contracts** | Solidity contract | Validate payments and NFT ownership |
| **Mirror Node API** | `/api/v1/transactions` | Fetch verified payment and mint history |
| **HashPack Wallet** | `hashconnect` SDK | Authenticate users and handle payments |

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/your-username/medchain-dapp.git
cd medchain-dapp
2. Install Dependencies
bash
Copy code
npm install
3. Setup Environment Variables
Create a .env file:

env
Copy code
HEDERA_ACCOUNT_ID=0.0.xxxx
HEDERA_PRIVATE_KEY=your_private_key
HEDERA_NETWORK=mainnet
MONGODB_URI=your_mongo_connection
4. Run the Development Server
bash
Copy code
npm run dev
💳 Example NFT Mint Flow
js
Copy code
// Mint NFT for consultation pass
POST https://testnet.mirrornode.hedera.com/api/v1/tokens

{
  "name": "Dr. Alice Consultation Pass",
  "symbol": "MEDPASS",
  "type": "NON_FUNGIBLE_UNIQUE",
  "memo": "Dermatology Consultation",
  "treasury_account_id": "0.0.xxxx"
}
Upon success:

NFT ID returned → stored in user record

Transaction visible via Mirror Node:

bash
Copy code
GET /api/v1/tokens/{tokenId}/nfts
GET /api/v1/transactions?account.id=0.0.xxxx
🔒 Smart Contract Example (Solidity)
solidity
Copy code
pragma solidity ^0.8.0;

contract ConsultationValidator {
    mapping(uint256 => address) public nftOwners;

    function validateConsultation(address patient, uint256 tokenId) public view returns (bool) {
        require(nftOwners[tokenId] == patient, "Not the owner of this consultation pass");
        return true;
    }

    function markComplete(uint256 tokenId) public {
        // Logic to release payment to doctor
    }
}
📡 Mirror Node Verification Example
bash
Copy code
GET https://mainnet.mirrornode.hedera.com/api/v1/transactions?account.id=0.0.xxxx
Response:

json
Copy code
{
  "transactions": [
    {
      "transaction_id": "0.0.xxxx@1735563333.000000000",
      "name": "TOKENMINT",
      "status": "SUCCESS",
      "consensus_timestamp": "1735563333.123456789"
    }
  ]
}
💅 UI Pages
Page	Description
/	Landing page with connect wallet CTA
/auth/login	Login form
/auth/signup	Register as doctor or patient
/dashboard/patient	Book doctor, view NFTs, transaction history
/dashboard/doctor	Manage bookings and NFT payments
/transactions	Verified Mirror Node transaction logs

💎 Tokenomics
Fungible Token: $MED — internal currency for consultation fees

NFTs: “Consultation Pass” minted per appointment

Royalties: Optionally, a small fee can go to platform treasury

🧠 Future Improvements
On-chain medical record NFTs (HIPAA-compliant metadata)

Integration with video consultation APIs (e.g., Zoom, Agora)

AI-powered doctor recommendation system
