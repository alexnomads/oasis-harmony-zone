
export interface SubItem {
  title: string;
  subitems: string[];
}

export interface PhaseItem {
  title: string;
  completed?: boolean;
  items: (string | SubItem)[];
}

export interface Phase {
  title: string;
  completed?: boolean;
  items?: (string | SubItem)[];
  phases?: PhaseItem[];
}

export const roadmapData: Phase[] = [
  {
    title: "Phase 0",
    completed: true,
    items: [
      "Our journey begins with a vision to transform wellness in the crypto space.",
      "Building a community-driven platform for meditation and mindfulness."
    ]
  },
  {
    title: "Phase 1 & 2",
    phases: [
      {
        title: "Phase 1",
        completed: true,
        items: [
          {
            title: "Meditation Timer System",
            subitems: [
              "Interactive timer with start/pause functionality",
              "Duration selection options",
              "Visual progress tracking",
              "Session completion tracking and rewards"
            ]
          },
          {
            title: "Points & Rewards System",
            subitems: [
              "Point earning based on meditation duration",
              "Bonus points for sharing sessions",
              "Meditation streaks tracking",
              "Total points accumulation"
            ]
          },
          {
            title: "User Dashboard",
            subitems: [
              "Personal meditation statistics",
              "Progress tracking",
              "Activity history visualization"
            ]
          },
          {
            title: "Global Leaderboard",
            subitems: [
              "Rankings based on total points",
              "Display of user meditation statistics",
              "View of most active meditators"
            ]
          },
          {
            title: "Social Sharing",
            subitems: [
              "Twitter/X integration for sharing wellness accomplishments",
              "Bonus point earning for social shares"
            ]
          },
          {
            title: "User Authentication",
            subitems: [
              "Secure login/signup system",
              "Protected routes for authenticated users",
              "User profile management"
            ]
          },
          {
            title: "Global Dashboard",
            subitems: [
              "Community-wide meditation statistics",
              "Real-time activity updates",
              "Time-filtered analytics"
            ]
          }
        ]
      },
      {
        title: "Phase 2",
        items: [
          {
            title: "Subscription Plans",
            subitems: [
              "Three-tier subscription model:",
              "Basic Plan (free)",
              "Pro Plan (paid subscription with monthly/yearly options)",
              "Enterprise Plan (custom pricing)",
              "Plan comparison with feature highlights",
              "20% discount for yearly subscriptions"
            ]
          },
          {
            title: "Web3 Integration",
            subitems: [
              "Wallet connection functionality",
              "Token ($ROJ) payment system for subscriptions",
              "Blockchain-based reward tracking"
            ]
          }
        ]
      }
    ]
  },
  {
    title: "Phase 3 & 4",
    phases: [
      {
        title: "Phase 3",
        items: [
          "Launch of the first Rose of Jericho (ROJ) pop-up at a major crypto conference.",
          "Initial token sale and distribution.",
          "Collect feedback for improvements."
        ]
      },
      {
        title: "Phase 4",
        items: [
          "Establish permanent Rose of Jericho (ROJ) wellness hubs in key crypto hubs (e.g., Singapore, Miami, Lisbon).",
          "Collaborate with Web3 health-tech projects to integrate innovative wellness solutions."
        ]
      }
    ]
  }
];
