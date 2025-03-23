# Web3 Airdrop DApp

A decentralized application (DApp) for managing token airdrops with referral system, built with Next.js, Wagmi, and Ethereum smart contracts.

## Features

### User Features
- **Wallet Connection**: Seamless wallet connection using RainbowKit
- **Airdrop Claiming**: Users can claim tokens through the airdrop system
- **Referral System**: 
  - Generate unique referral links
  - Earn bonus tokens for successful referrals
  - Track referral statistics
- **User Dashboard**:
  - View participation status
  - Track total earnings
  - Monitor referral count
  - View transaction history
  - Copy and share referral links
  - Check airdrop details and rewards

### Admin Features
- **Admin Panel**: Special access for contract owner
- **Airdrop Management**:
  - Set base airdrop amount
  - Configure referral bonus
  - Adjust participation fees
  - Monitor overall participation

### Technical Features
- Responsive design for mobile and desktop
- Real-time blockchain interactions
- Secure wallet integration
- Transaction notifications
- Gas fee estimation
- Smart contract integration

## Tech Stack

### Frontend
- Next.js
- React
- Wagmi
- RainbowKit
- Ethers.js
- TailwindCSS

### Blockchain
- Ethereum/BSC Smart Contracts
- Solidity
- Hardhat (Development)

## Installation

1. Clone the repository:
git clone https://github.com/blcdevs/airdrop-dapp
cd airdrop-dapp

2. Install dependencies:
npm install
# or
yarn install

3. Configure environment variables:
Create a `.env.local` file in the root directory:
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_id
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_ADMIN_ADDRESS=your_admin_address

4. Run the development server:
npm run dev
# or
yarn dev

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Smart Contract Configuration

1. Deploy the smart contract to your chosen network
2. Update the contract address in your environment variables
3. Configure the following parameters in the smart contract:
   - Base airdrop amount
   - Referral bonus amount
   - Participation fee
   - Admin address

## Usage

### For Users
1. Connect your Web3 wallet
2. If you have a referral link, use it to get additional rewards
3. Pay the participation fee to claim the airdrop
4. Share your referral link with others
5. Track your earnings and referrals in the dashboard

### For Admins
1. Connect with admin wallet
2. Access admin panel
3. Manage airdrop parameters
4. Monitor participation statistics

## Project Structure
web3-airdrop-dapp/
├── components/          # React components
├── context/            # Context providers
├── pages/              # Next.js pages
├── public/             # Static assets
├── styles/            # CSS modules and global styles
├── utils/             # Utility functions
└── provider/          # Web3 providers and configs

## Security Considerations

- Secure wallet connection handling
- Protected admin routes
- Input validation
- Gas fee estimation
- Transaction confirmation handling
- Error boundary implementation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@yourdomain.com or join our Discord channel.

## Acknowledgments

- RainbowKit team for wallet connection
- Wagmi for React Hooks
- Next.js team for the framework
- OpenZeppelin for smart contract standards

## Contact

blcdevs - [@blcdevs](https://twitter.com/blcdevs)
Project Link: [https://github.com/blcdevs/airdrop-dapp](https://github.com/blcdevs/airdrop-dapp)