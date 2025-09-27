# StudyAI - Générateur de Révisions

StudyAI est une application MVP qui transforme vos PDFs de cours en notes de révision structurées et quiz interactifs grâce à l'IA.

## 🚀 Fonctionnalités

- **Upload PDF** : Glissez-déposez ou sélectionnez un fichier PDF
- **Extraction de texte** : Extraction automatique du contenu avec PyMuPDF
- **Génération IA** : Création de notes de révision et QCM avec OpenAI
- **Interface moderne** : Interface utilisateur responsive avec Next.js et Tailwind CSS
- **Quiz interactif** : 5 questions à choix multiples avec explications

## 🛠️ Stack Technique

### Backend
- **FastAPI** (Python 3.11+) - API REST
- **PyMuPDF** - Extraction de texte PDF
- **OpenAI API** - Génération de contenu IA
- **Pydantic** - Validation des données
- **Uvicorn** - Serveur ASGI

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **React Dropzone** - Upload de fichiers

## 📋 Prérequis

- Python 3.11+
- Node.js 18+
- npm ou yarn
- Clé API OpenAI

## 🚀 Installation et Lancement

### 1. Backend

```bash
# Naviguer vers le dossier backend
cd backend

# Créer un environnement virtuel
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -e .

# Configurer les variables d'environnement
cp env.example .env
# Éditer .env et ajouter votre clé API OpenAI
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-4o-mini

# Lancer le serveur
./uvicorn.run
# Ou manuellement: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Le backend sera accessible sur : http://localhost:8000
Documentation API : http://localhost:8000/docs

### 2. Frontend

```bash
# Naviguer vers le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp env.local.example .env.local
# Le fichier .env.local contient déjà la bonne URL API

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur : http://localhost:3000

## 📁 Structure du Projet

```
StudyAI/
├── README.md
├── backend/
│   ├── pyproject.toml
│   ├── uvicorn.run
│   ├── env.example
│   └── app/
│       ├── __init__.py
│       ├── main.py          # API FastAPI
│       ├── schemas.py       # Modèles Pydantic
│       ├── pdf.py          # Extraction PDF
│       └── llm.py          # Intégration OpenAI
└── frontend/
    ├── package.json
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── env.local.example
    └── src/
        └── app/
            ├── layout.tsx
            ├── page.tsx
            ├── globals.css
            └── (components)/
                ├── FileDrop.tsx
                ├── ResultNotes.tsx
                └── ResultQuiz.tsx
```

## 🔧 API Contract

### POST /generate

**Request** : Multipart form avec fichier PDF
**Response** : JSON avec structure exacte

```json
{
  "notes": [
    {
      "title": "Titre de section",
      "bullets": ["point 1", "point 2", "point 3"]
    }
  ],
  "quiz": [
    {
      "question": "Question MCQ?",
      "choices": ["A", "B", "C", "D"],
      "answer_index": 1,
      "explanation": "Explication de la réponse correcte."
    }
  ],
  "meta": {
    "tokens_input": 0,
    "tokens_output": 0,
    "model": "gpt-4o-mini"
  }
}
```

## 🔒 Sécurité et Limites MVP

- **Clé API** : Stockée uniquement côté serveur, jamais exposée au frontend
- **Validation** : Validation stricte des données avec Pydantic
- **Limite de taille** : PDFs tronqués à ~60k caractères
- **Stockage** : Aucune base de données, tout en mémoire
- **RGPD** : Les fichiers sont traités en mémoire et supprimés après traitement

## 🐛 Dépannage

### Erreurs courantes

1. **"OpenAI API key not configured"**
   - Vérifiez que le fichier `.env` existe dans le dossier backend
   - Assurez-vous que `OPENAI_API_KEY` est correctement défini

2. **"No text could be extracted from the PDF"**
   - Vérifiez que le PDF contient du texte (pas seulement des images)
   - Essayez avec un PDF différent

3. **"Failed to generate content"**
   - Vérifiez votre clé API OpenAI
   - Le contenu peut être trop long, essayez avec un PDF plus court

4. **Erreurs CORS**
   - Assurez-vous que le backend tourne sur le port 8000
   - Vérifiez que le frontend pointe vers la bonne URL API

## 📝 Notes de Développement

- **TypeScript strict** activé sur le frontend
- **Validation Pydantic** avec messages d'erreur détaillés
- **Gestion d'erreurs** gracieuse avec retry automatique
- **Interface responsive** optimisée pour mobile et desktop
- **ESLint** configuré avec les règles Next.js par défaut

## 🚀 Prochaines Étapes

- [ ] Base de données pour persister les résultats
- [ ] Authentification utilisateur
- [ ] Support de plus de formats de fichiers
- [ ] Export des notes en PDF
- [ ] Mode sombre
- [ ] Tests automatisés
