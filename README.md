# AquaSense : Système d’Irrigation Intelligent basé sur l’IoT

## 📝 Description du Projet
**AquaSense** est une solution innovante conçue pour optimiser la gestion de l'irrigation dans l'agriculture, particulièrement adaptée au contexte marocain où la rareté des ressources hydriques est un défi majeur. Le système utilise des capteurs pour mesurer l'humidité du sol et automatise l'arrosage en fonction des besoins réels des plantes, réduisant ainsi le gaspillage d'eau.

L'objectif principal est de passer d'une irrigation manuelle basée sur l'estimation à une gestion précise basée sur des données réelles.

---
## 📁 Structure du projet

- `iot/` — Firmware ESP32 et projet PlatformIO pour les capteurs, la lecture DHT et le contrôle de la pompe.
- `code_prj/backend/` — API FastAPI pour la collecte des données, la gestion de la base et le pilotage de la pompe.
- `code_prj/data_analysis/` — Microservice IA et modèle de prédiction pour la décision d'irrigation.
- `code_prj/frontend/` — Interface utilisateur React/Vite pour le tableau de bord et le contrôle.

---
<!-- 
## 🏗️ Architecture du Système
[cite_start]Le projet repose sur une architecture multidisciplinaire divisée en quatre parties principales[cite: 29]:
1.  [cite_start]**Les Capteurs :** Collecte des données environnementales (humidité du sol, température et humidité de l'air)[cite: 30, 35].
2.  [cite_start]**Le Microcontrôleur (Cœur du système) :** Analyse les données et contrôle les actionneurs[cite: 31, 42].
3.  [cite_start]**Communication :** Transmission des données via WiFi vers une base de données[cite: 32, 85].
4.  [cite_start]**Interface d'Analyse :** Visualisation des données et historique pour l'utilisateur[cite: 33, 39].

---

## 👥 L'Équipe et Rôles
Ce projet est une collaboration entre trois spécialités :
* [cite_start]**Génie Logiciel (Lead : [Votre Nom]) :** Développement de l'interface de visualisation, gestion de la base de données et de l'architecture backend[cite: 86, 87].
* [cite_start]**Systèmes Embarqués (Lead : Nassima) :** Configuration du matériel (ESP32), lecture des capteurs et contrôle de la pompe via le relais[cite: 46, 66, 70].
* [cite_start]**Data & IA (Lead : Abdellah) :** Stockage, analyse des tendances de consommation d'eau et production de statistiques[cite: 96, 97, 100].

---

## 🛠️ Spécifications Techniques

### Matériel Utilisé (Hardware)
* [cite_start]**Microcontrôleur :** ESP32 (choisi pour son WiFi intégré et sa faible consommation)[cite: 44, 45].
* [cite_start]**Capteur d'humidité du sol :** Mesure la conductivité pour détecter si le sol est sec[cite: 47, 50].
* [cite_start]**Capteur DHT (11 ou 22) :** Mesure la température et l'humidité de l'air[cite: 54, 55].
* [cite_start]**Actionneurs :** Module relais pour activer/désactiver la pompe à eau[cite: 59, 62].

### Logiciel et Données (Software & Data)
* [cite_start]**Interface :** Application web ou tableau de bord pour afficher les mesures en temps réel[cite: 93, 95].
* [cite_start]**Analyses :** Suivi de l'évolution de l'humidité et de la fréquence d'irrigation[cite: 103, 104].

---

## 🚀 Résultats Attendus
* [cite_start]Réduction significative du gaspillage d'eau[cite: 113].
* [cite_start]Irrigation automatisée et plus efficace[cite: 114].
* [cite_start]Surveillance en temps réel des cultures via une interface dédiée[cite: 115].

---

## 📈 Perspectives d'Avenir
* [cite_start]Intégration de l'intelligence artificielle pour prédire les besoins en eau[cite: 121].
* [cite_start]Utilisation de panneaux solaires pour l'autonomie énergétique[cite: 119].
* [cite_start]Développement d'une application mobile dédiée[cite: 120].

 -->