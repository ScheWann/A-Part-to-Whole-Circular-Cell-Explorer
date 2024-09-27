# A Part-to-Whole Circular Cell Explorer
Siyuan Zhao and G. Elisabeta Marai

<img src="./RedesignChallenge/Frontend/public/Comparation.png"/>

## Data
This project uses data from [Bio+Med Challenge 2024](http://biovis.net/2024/biovisChallenges_vis/) and [Visium data](https://www.ebi.ac.uk/biostudies/arrayexpress/studies/E-MTAB-11114) from Kleshchevnikov et al., 2022, filter by sample ST8059049

## Setup Instructions
This project uses [Flask](https://flask.palletsprojects.com/en/3.0.x/) to provide data and API and [React](https://react.dev/) to provide data display

### Backend
1. Install and update using [pip](https://pip.pypa.io/en/stable/getting-started/)

2. Go to **RedesignChallenge/Backend** folder

3. Create venv environment(**Mac command**)
   ```
   python -m venv venv
   ```

4. Run venv environment(**Mac command**)
   ```
   source venv/bin/activate
   ```

5. You'll need Flask and other related packages installed
   ```
   pip install -r requirements.txt
   ```

6. Run the Flask Application
   ```
   python server.py
   ```

### Frontend
1. Go **RedesignChallenge/Frontend** folder

2. Install [Node.js](https://nodejs.org/en)(if you do not have on your local machine)

3. Install necessary packages
   ```
   npm install
   ```
4. Run the React
   ```
   npm start
   ```