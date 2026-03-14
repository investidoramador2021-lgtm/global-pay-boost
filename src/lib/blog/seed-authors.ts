import type { BlogAuthor } from "./types";

export const seedAuthors: Record<"danielCarter" | "sophiaRamirez" | "marcusChen" | "elenaVolkova", BlogAuthor> = {
  danielCarter: {
    name: "Daniel Carter",
    role: "Senior Blockchain Analyst",
    bio: "Daniel has spent eight years working across crypto trading desks, first at Cumberland DRW and later at a mid-cap digital asset fund. He now writes about market microstructure, swap execution, and DeFi infrastructure. He holds a CFA charter and a Master's in Financial Engineering from Columbia University.",
    credentials: "CFA Charterholder · Columbia MFE · 8 years in digital asset trading",
  },
  sophiaRamirez: {
    name: "Sophia Ramirez",
    role: "DeFi Infrastructure Researcher",
    bio: "Sophia spent four years as a protocol engineer at a Layer 1 blockchain before transitioning to research and education. She specializes in AMM design, cross-chain bridging, and liquidity aggregation architecture. Her work has been cited by Messari, The Block, and Delphi Digital.",
    credentials: "Former L1 Protocol Engineer · Published in Messari & The Block · MSc Computer Science, ETH Zurich",
  },
  marcusChen: {
    name: "Marcus Chen",
    role: "Cybersecurity Lead & Crypto Security Advisor",
    bio: "Marcus has fifteen years in information security, including six years focused on cryptocurrency custody, wallet security, and exchange infrastructure. He previously led the security team at a top-20 centralized exchange and now advises DeFi protocols on threat modeling.",
    credentials: "CISSP · OSCP · Former Security Lead at top-20 CEX · 15 years in InfoSec",
  },
  elenaVolkova: {
    name: "Elena Volkova",
    role: "Crypto Markets Strategist",
    bio: "Elena worked as a quantitative analyst at Jane Street before moving into crypto full-time in 2021. She covers macro trends, on-chain analytics, and trading pair dynamics for institutional and retail audiences. She contributes market commentary to CoinDesk and Blockworks.",
    credentials: "Former Quant Analyst, Jane Street · CoinDesk & Blockworks contributor · MSc Mathematics, MIT",
  },
};
