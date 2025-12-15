# BloodyVenom

**BloodyVenom** is a horror-themed social community platform where users choose a “horror power” in the form of an animal and join a cult-like community. The platform allows users to interact, discuss ideas, share posts, and participate in thematic roleplay, all while maintaining a dark, bloody, and immersive horror aesthetic.

> ⚠️ Disclaimer: This site is for entertainment, roleplay, and community interaction only. No real-life harm is encouraged.

---

## Table of Contents

1. [Features](#features)  
2. [User Flow](#user-flow)  
3. [Animal Powers](#animal-powers)  
4. [Community Functionality](#community-functionality)  
5. [Technology Stack](#technology-stack)  
6. [Next Steps / Roadmap](#next-steps--roadmap)  
7. [Aesthetic Guidelines](#aesthetic-guidelines)  

---

## Features

- **Dark Horror Theme:** Creepy horror aesthetic with blood-red accents, dark backgrounds, and horror-themed fonts.  
- **Hero Section:** Full-screen video hero with overlay, login/register buttons, and a “Be a Horror?” tagline.  
- **Feature Selection:** Users select a horror animal/power (e.g., Spider, Serpent, Wolf) to define their role in the community.  
- **Tiered Powers:** Features are categorized by tier: **Initiate (Free)**, **Acolyte (Paid)**, **Overlord (Premium Paid)**. Users start with free features and can upgrade to paid powers.  
- **Feature Detail Pages:** Each animal has a detail page explaining their powers, cost, and abilities.  
- **Community Dashboard:** Social feed where users can post discussions, comment, like, and reshare content.  
- **User Profiles:** Displays user’s selected power, posts, likes, badges, and tier.  
- **Responsive Design:** Works on desktop, tablet, and mobile devices.  

---

## User Flow

1. **Register/Login** → User creates an account or logs in.  
2. **Select Horror Power** → User chooses an animal representing their horror persona.  
3. **Feature Detail** → Users view the abilities, tier, and story of their selected animal.  
4. **Community Dashboard** → Users interact with others, post topics, comment, like, and reshare posts.  
5. **Profile** → Users view their selected power, tier, badges, posts, and interactions.  

---

## Animal Powers

| Animal        | Tier       | Cost  | Power / Ability |
|---------------|------------|-------|----------------|
| Spider 🕷️     | Initiate   | Free  | Crawl unseen in shadows, trap enemies in fear (stealth & manipulation) |
| Cat 🐈        | Initiate   | Free  | Silent predator, night vision (stealth & grace) |
| Dog 🐕        | Initiate   | Free  | Loyal companion, guardian of the cult (protection & loyalty) |
| Monkey 🐒     | Acolyte    | $5    | Deceptive, chaotic, agile (trickery & unpredictability) |
| Bat 🦇        | Acolyte    | $8    | Fly through darkness, echolocation (vision & mobility) |
| Wolf 🐺       | Acolyte    | $10   | Enhanced senses, pack dominance (strength & leadership) |
| Serpent 🐍    | Overlord   | $20   | Strike with precision, venomous attack (danger & cunning) |
| Scorpion 🦂   | Overlord   | $25   | Venomous sting, defense master (lethal & strategic) |

> Users start with **Initiate** features for free and can later upgrade to **Acolyte** or **Overlord** powers. Each power comes with a unique hero video, description, and in-game/cult abilities.

---

## Community Functionality

- **Posts / Discussions:** Users can create posts with title, content, and optional media.  
- **Interactions:** Posts can be liked, commented on, and reshared.  
- **Discussion Rooms:** Optional grouping of posts by animal power, tier, or topic.  
- **Gamification:** Badges, tier visuals, and effects based on powers and user activity.  
- **Social Hub:** Users can explore other members’ powers, posts, and discussions.  

---

## Technology Stack

- **Backend:** Flask (Python)  
- **Frontend:** HTML, CSS (with horror-themed Google Fonts), JavaScript  
- **Database:** SQLite (initially) for users, posts, comments, likes  
- **Media:** Local video assets for hero sections and animal powers  
- **Responsive Design:** Grid and flexbox for feature cards, social feed, and modals  

---

## Next Steps / Roadmap

1. **Feature Details:** Implement detail pages for each animal, showing videos, descriptions, powers, and tier info.  
2. **Dashboard / Feed:** Create a community feed with posts, likes, comments, and reshares.  
3. **Post Creation:** Allow users to create posts with title, content, and optional media.  
4. **Interactions:** Implement like, comment, and reshare functionality with live updates.  
5. **Profiles:** Create user profiles showing selected powers, tiers, posts, badges, and activity.  
6. **Monetization:** Enable upgrades from free features to paid Acolyte and Overlord powers.  
7. **Gamification:** Add badges, leaderboards, or cosmetic effects based on powers.  
8. **Security:** Ensure login-required routes, password hashing, and session management.  
9. **Enhancements:** Optional features like private rooms, power-specific discussion groups, or horror storytelling mini-games.  

---

## Aesthetic Guidelines

- **Fonts:** Horror-themed (e.g., Creepster).  
- **Colors:** Dark red (`#100000`, `#1a0000`), crimson (`#ff0000`), subtle black overlays.  
- **Videos:** Hero videos for main banner and animal features.  
- **Glassy & Bloody Effects:** Navbar, buttons, modals with glassy overlays and blood-red glow.  
- **Animations:** Hover effects, button scaling, and video overlays.