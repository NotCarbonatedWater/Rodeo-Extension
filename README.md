Rodeo AI Messaging Chrome Extension 

To add to chrome: 
1. yarn build
2. Open Chrome -> Extension -> Manage Extensions
3. set development mode 
4. Load -> select build folder 

To update extension with new build: 
1. yarn build 
2. Open Chrome -> Extension -> Manage Extensions
3. select Update OR reload button in packet box 

Note: 
- create .env and add OpenAI API key 

How to Use: 
1. Options: 
- cold open: open extension and click "cold open"
- follow-up: open extension and click "follow-up"
- follow-up(based on selection): highlight text, open extension and click "follow-up"
- reply: highlight text, open extension and click "reply"
2. Text box will show result, User can then decide to:
- copy to clipboard by clicking "copy"
- generate a new message by clicking "reload"
