# 📱 Application Mobile de Gestion des Réserves - Guide d'Utilisation

## 🎯 Vue d'Ensemble

Cette application mobile permet aux agents de terrain de **créer et délimiter des réserves** directement sur le terrain en utilisant le GPS de leur téléphone Android. Les données sont automatiquement synchronisées avec le backend et visibles sur le frontend web.

---

## 🚀 Démarrage de l'Application

### 1. Installation

L'application peut être installée de deux façons :

**Option A : APK Précompilé** (Recommandé)
- Téléchargez le fichier `app-debug.apk` ou `app-release.apk`
- Transférez-le sur votre téléphone Android
- Autorisez l'installation depuis des sources inconnues
- Installez l'application

**Option B : Via Flutter** (Développement)
```bash
flutter run
```

### 2. Premier Lancement

Au lancement, vous arriverez sur l'écran de connexion.

---

## 🔐 Connexion

### Écran de Connexion

![Écran de connexion](connexion_screen.png)

**Champs requis** :
- **Username** : Votre nom d'utilisateur
- **Password** : Votre mot de passe

### Messages de Retour

**✅ Connexion Réussie**
- Message vert : "Connexion réussie !"
- Redirection automatique vers l'écran d'accueil

**❌ Erreur de Connexion**
- Message rouge : "Identifiants incorrects. Veuillez réessayer."
- Vérifiez vos identifiants et réessayez

**⚠️ Champs Vides**
- Message orange : "Veuillez remplir tous les champs"
- Assurez-vous de remplir username ET password

**🔄 Chargement**
- Un indicateur de chargement s'affiche pendant la vérification

---

## 🏠 Écran d'Accueil

Après connexion, vous accédez à l'écran d'accueil avec plusieurs options :

### Options Disponibles

1. **📍 Nouvelle Réserve** : Créer une nouvelle réserve sur le terrain
2. **📋 Mes Réserves** : Voir la liste des réserves créées
3. **⚙️ Paramètres** : Configuration de l'application
4. **🚪 Déconnexion** : Se déconnecter de l'application

---

## 🗺️ Création d'une Réserve

### Étape 1 : Lancer la Délimitation

1. Cliquez sur **"Nouvelle Réserve"**
2. L'écran de carte s'ouvre avec votre position GPS
3. Autorisez l'accès à la localisation si demandé

### Étape 2 : Activer le Tracking GPS

**Bouton de Tracking** (en bas de l'écran)
- 🔵 **Bleu** : Tracking activé
- ⚪ **Gris** : Tracking désactivé

**Fonctionnement** :
- Activez le tracking pour que la carte suive votre position en temps réel
- La caméra se centre automatiquement sur votre position
- Votre position est marquée par un point bleu

### Étape 3 : Ajouter des Points

**Marcher le Périmètre** :
1. Marchez le long du périmètre de la réserve
2. À chaque coin ou changement de direction, appuyez sur **"Ajouter Point"** (bouton +)
3. Un marqueur numéroté apparaît à votre position actuelle

**Visualisation en Temps Réel** :
- 🟢 **Point 1** : Marqueur vert (point de départ)
- 🔴 **Points suivants** : Marqueurs rouges numérotés
- 🔵 **Ligne bleue** : Relie tous les points ajoutés
- ⚪ **Ligne temporaire** : Montre le tracé vers votre position actuelle

**Précision GPS** :
- ⚠️ Si la précision est > 50m, un avertissement s'affiche
- Attendez que le signal GPS s'améliore avant d'ajouter le point
- La précision est affichée en temps réel

### Étape 4 : Fermer le Polygone

**Conditions** :
- Minimum **3 points** requis
- Cliquez sur **"Fermer Polygone"**

**Résultat** :
- Une ligne verte relie le dernier point au premier
- Le polygone se remplit en bleu transparent
- Les statistiques sont calculées automatiquement :
  - 📏 **Périmètre** : en mètres
  - 📐 **Surface** : en m² et hectares
  - 📍 **Nombre de points**

### Étape 5 : Sauvegarder la Réserve

1. Cliquez sur **"Sauvegarder"**
2. Entrez un **nom** pour la réserve (ex: "Réserve Forêt Nord")
3. Cliquez sur **"Sauvegarder"**

**Processus de Sauvegarde** :
1. 💾 **Sauvegarde locale** : Données stockées sur le téléphone
2. 🌐 **Synchronisation backend** : Envoi au serveur
3. 🔢 **Code généré** : Le backend génère un code unique (ex: RES-0001)
4. ✅ **Confirmation** : Message de succès avec le code

**Messages Possibles** :
- ✅ **"Réserve sauvegardée et synchronisée ! Code: RES-0001"**
  - Tout s'est bien passé
  - La réserve est visible sur le web
  
- ⚠️ **"Réserve sauvegardée localement. Synchronisation backend échouée."**
  - Données sauvegardées sur le téléphone
  - Problème de connexion au serveur
  - La synchronisation se fera plus tard

---

## 🛠️ Fonctionnalités Avancées

### Contrôles de Carte

**Zoom** :
- **+** : Zoom avant
- **-** : Zoom arrière
- **🎯** : Centrer sur ma position

**Styles de Carte** :
- 🛰️ **Satellite Streets** : Vue satellite avec routes (par défaut)
- 🗺️ **Satellite** : Vue satellite pure
- 🏞️ **Outdoors** : Carte topographique
- 🏙️ **Streets** : Carte routière

**Vue 3D** :
- Bouton **3D** : Active/désactive la vue inclinée
- Effet "Google Earth" pour mieux visualiser le terrain

### Gestion des Points

**Supprimer le Dernier Point** :
- Bouton **"Annuler"** ou icône ↩️
- Supprime le dernier point ajouté

**Tout Effacer** :
- Bouton **"Effacer Tout"**
- Confirmation demandée
- Supprime tous les points et recommence

**Zoom sur la Zone** :
- Bouton **"Ajuster"** ou 🔍
- Ajuste automatiquement le zoom pour voir tous les points

### Export de Données

**Export JSON** :
- Bouton **"Exporter"** ou 📥
- Génère un fichier JSON avec :
  - Coordonnées GPS de tous les points
  - Métadonnées (date, précision, etc.)
  - Format GeoJSON standard

---

## 📊 Statistiques en Temps Réel

Pendant la délimitation, un panneau affiche :

**📍 Points** : Nombre de points ajoutés  
**📏 Périmètre** : Distance totale en mètres  
**📐 Surface** : Aire en m² (si polygone fermé)  
**🎯 Précision GPS** : Précision actuelle en mètres

---

## ⚠️ Conseils d'Utilisation

### Pour une Meilleure Précision GPS

✅ **Testez en extérieur** avec ciel dégagé  
✅ **Attendez** que la précision soit < 20m  
✅ **Évitez** les zones avec beaucoup d'arbres ou de bâtiments  
✅ **Activez** le mode haute précision dans les paramètres Android

### Gestion de la Batterie

🔋 Le tracking GPS consomme de la batterie :
- Apportez une **batterie externe** pour les longues sessions
- Désactivez le tracking quand vous ne marchez pas
- Fermez les autres applications

### Connexion Réseau

📶 Pour la synchronisation :
- **Wi-Fi** : Connectez-vous au même réseau que le serveur
- **Données mobiles** : Assurez-vous d'avoir du réseau
- **Mode hors ligne** : Les données sont sauvegardées localement et se synchroniseront plus tard

---

## 🔄 Synchronisation avec le Backend

### Automatique

Lors de la sauvegarde d'une réserve :
1. Sauvegarde locale immédiate
2. Tentative de synchronisation automatique
3. Affichage du résultat (succès ou échec)

### Manuelle (À venir)

Dans **Mes Réserves** :
- Icône 🔄 à côté des réserves non synchronisées
- Cliquez pour forcer la synchronisation

---

## 📱 Visualisation sur le Web

Une fois synchronisée, la réserve est **immédiatement visible** sur le frontend web :

1. Ouvrez le frontend web sur un PC
2. Connectez-vous avec vos identifiants
3. Allez dans **"Réserves"**
4. Votre réserve apparaît dans le tableau avec :
   - Code unique (RES-0001, etc.)
   - Nom
   - Superficie
   - Localisation
   - Coordonnées GPS

---

## 🐛 Résolution de Problèmes

### GPS ne fonctionne pas

**Problème** : Position GPS non disponible

**Solutions** :
1. Vérifiez que la localisation est activée dans Android
2. Autorisez l'accès à la localisation pour l'app
3. Sortez à l'extérieur pour un meilleur signal
4. Redémarrez l'application

### Synchronisation échoue

**Problème** : "Synchronisation backend échouée"

**Solutions** :
1. Vérifiez votre connexion internet
2. Assurez-vous que le backend est démarré
3. Vérifiez que vous êtes sur le même réseau Wi-Fi (si en local)
4. Les données sont sauvegardées localement, réessayez plus tard

### Carte ne s'affiche pas

**Problème** : Écran gris/vide

**Solutions** :
1. Vérifiez votre connexion internet
2. Attendez quelques secondes que la carte se charge
3. Redémarrez l'application
4. Vérifiez que Mapbox est correctement configuré

### Précision GPS faible

**Problème** : Précision > 50m

**Solutions** :
1. Attendez quelques minutes que le GPS se stabilise
2. Déplacez-vous dans une zone dégagée
3. Vérifiez que le mode haute précision est activé
4. Redémarrez le GPS du téléphone

---

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation technique
- Contactez l'administrateur système
- Vérifiez les logs de l'application

---

## 🎉 Bonnes Pratiques

### Avant de Partir sur le Terrain

✅ Chargez complètement votre téléphone  
✅ Apportez une batterie externe  
✅ Testez la connexion au backend  
✅ Vérifiez que le GPS fonctionne  
✅ Téléchargez les cartes hors ligne (si disponible)

### Pendant la Délimitation

✅ Marchez lentement le long du périmètre  
✅ Ajoutez des points aux coins et changements de direction  
✅ Vérifiez la précision GPS avant chaque point  
✅ Sauvegardez régulièrement si la zone est grande

### Après la Délimitation

✅ Vérifiez que la réserve est bien fermée  
✅ Contrôlez les statistiques (surface, périmètre)  
✅ Donnez un nom descriptif  
✅ Attendez la confirmation de synchronisation  
✅ Vérifiez sur le web que la réserve est visible

---

**Version** : 1.0  
**Dernière mise à jour** : Février 2026
