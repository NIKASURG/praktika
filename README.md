# Skelbimų aplikacija
 
Skelbimų interneto aplikacija: backend – Node.js + Express + MongoDB, frontend – React (Vite) + Bootstrap.
 
## Reikalavimai
 
- Node.js 20 ar naujesnis
- MongoDB duomenų bazė (pvz. MongoDB Atlas)
## Paleidimas
 
### 1. Backend
 
```bash
cd backend
npm install
```
 
Sukurk failą `backend/.env`:
 
```
MONGO_URI=mongodb+srv://vartotojas:slaptazodis@cluster0.xxxxx.mongodb.net/
```
 
Paleisk:
 
```bash
npm run dev
```
 
Backend veikia adresu http://localhost:3000. Pirmą kartą paleidus automatiškai sukuriamas administratorius.
 
### 2. Frontend
 
Kitame terminale:
 
```bash
cd frontend
npm install
npm run dev
```
 
Atsidaryk http://localhost:5173
 
## Prisijungimo duomenys
 
| Rolė | Vartotojas | Slaptažodis |
|---|---|---|
| Administratorius | `admin` | `admin123` |
| Vartotojas | `jonas` | `jonas123` (susikurk per „Registruotis“) |
 
## Kaip išbandyti
 
**Svečias (neprisijungęs):** ieško skelbimų pagal kategoriją ir frazę, skaito skelbimus ir komentarus.
 
**Vartotojas:**
- kuria, redaguoja ir trina savo skelbimus („Mano skelbimai“);
- komentuoja skelbimus;
- žymi patikusius skelbimus žvaigždute („Patikę“);
- trina komentarus po savo skelbimais.
**Administratorius:**
- kuria kategorijas ir blokuoja vartotojus („Admin“);
- skelbimo puslapyje blokuoja skelbimus ir komentarus.
Pirmiausia prisijunk kaip administratorius ir sukurk kategorijas, nes be jų nepavyks sukurti skelbimo.
 